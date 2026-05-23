export const runSimulation = (components, wires, componentMap) => {
    const getNodeId = (compId, portId) => `${compId}_${portId}`;

    let activeComponents = [...components];
    let activeWires = wires.map(w => ({ ...w, state: 'off' }));
    let isShortCircuit = false;

    // We run the simulation in multiple passes to handle feedback loops (like latching)
    // 50 iterations ensures stability for complex Star-Delta transitions
    for (let iteration = 0; iteration < 50; iteration++) {
        let changed = false;

        // 1. Build Graphs
        const fullGraph = {};
        const directGraph = {};
        const status = {};

        // Recalculate powered tags based on CURRENT activeComponents state for this iteration
        const poweredTags = new Set(
            activeComponents
                .filter(c => (c.componentId === 'Relay' || c.componentId === 'Contactor' || c.componentId === 'OnDelayTimer') && c.isOn)
                .map(c => (c.prefix || componentMap[c.componentId].prefix || "") + (c.tagIndex || 1))
        );

        components.forEach(comp => {
            componentMap[comp.componentId].ports.forEach(port => {
                const id = getNodeId(comp.id, port.id);
                fullGraph[id] = new Set();
                directGraph[id] = new Set();
                status[id] = { line: false, neutral: false, dLine: false, dNeutral: false, l1: false, l2: false, l3: false };
            });
        });

        // Wires
        wires.forEach(w => {
            const f = getNodeId(w.from.compId, w.from.portId), t = getNodeId(w.to.compId, w.to.portId);
            if (fullGraph[f] && fullGraph[t]) {
                fullGraph[f].add(t); fullGraph[t].add(f);
                directGraph[f].add(t); directGraph[t].add(f);
            }
        });

        // Internal Connections with Logic
        components.forEach(comp => {
            const index = comp.tagIndex || 1;
            const prefix = comp.prefix || componentMap[comp.componentId].prefix || "";
            const fullName = prefix + index;
            const isEnergized = poweredTags.has(fullName);

            if (comp.componentId === 'NCContact' || comp.componentId === 'NOContact' || comp.componentId === 'PushButtonNC' || comp.componentId === 'PushButtonNO' || comp.componentId === 'SinglePoleCB') {
                const inId = getNodeId(comp.id, 'in'), outId = getNodeId(comp.id, 'out');
                if (!fullGraph[inId]) return;

                let isClosed = false;
                if (comp.componentId === 'NCContact') isClosed = !isEnergized;
                else if (comp.componentId === 'NOContact') isClosed = isEnergized;
                else if (comp.componentId === 'PushButtonNC') isClosed = !comp.isPressed;
                else if (comp.componentId === 'PushButtonNO') isClosed = comp.isPressed;
                else if (comp.componentId === 'SinglePoleCB') isClosed = comp.isPressed;

                if (isClosed) {
                    fullGraph[inId].add(outId); fullGraph[outId].add(inId);
                    directGraph[inId].add(outId); directGraph[outId].add(inId);
                }
            } else if (comp.componentId === 'ThreePoleCB' || comp.componentId === 'ContactorMainContacts') {
                const prefix = comp.prefix || componentMap[comp.componentId].prefix || "";
                const fullName = prefix + (comp.tagIndex || 1);
                const isEnergized = poweredTags.has(fullName);

                // For CB, it's isPressed. For Contactor, it's isEnergized.
                const isClosed = comp.componentId === 'ThreePoleCB' ? comp.isPressed : isEnergized;

                if (isClosed) {
                    const poles = ['L1', 'L2', 'L3'];
                    poles.forEach(p => {
                        const pIn = getNodeId(comp.id, p + '_in'), pOut = getNodeId(comp.id, p + '_out');
                        if (fullGraph[pIn] && fullGraph[pOut]) {
                            fullGraph[pIn].add(pOut); fullGraph[pOut].add(pIn);
                            directGraph[pIn].add(pOut); directGraph[pOut].add(pIn);
                        }
                    });
                }
            }
        });

        // 2. Identify Direct Zones
        const lineSeeds = components.filter(c => c.componentId === 'PowerLine' || c.componentId === 'ThreePhaseLine').flatMap(c => componentMap[c.componentId].ports.map(p => getNodeId(c.id, p.id)));
        const neutralSeeds = components.filter(c => c.componentId === 'Nutral').flatMap(c => componentMap[c.componentId].ports.map(p => getNodeId(c.id, p.id)));

        const findDirect = (seeds, key) => {
            const q = [...seeds], vis = new Set(seeds);
            seeds.forEach(s => status[s][key] = true);
            while (q.length > 0) {
                const c = q.shift();
                directGraph[c].forEach(n => { if (!vis.has(n)) { vis.add(n); status[n][key] = true; q.push(n); } });
            }
        };
        findDirect(lineSeeds, 'dLine');
        findDirect(neutralSeeds, 'dNeutral');

        // 3. Propagate Potentials
        const propagate = (key, blockersKey) => {
            const startNodes = Object.keys(status).filter(id => status[id][key === 'line' ? 'dLine' : 'dNeutral']);
            const q = [...startNodes], vis = new Set(startNodes);
            startNodes.forEach(s => status[s][key] = true);
            while (q.length > 0) {
                const curr = q.shift();
                if (status[curr][blockersKey]) continue;
                fullGraph[curr].forEach(next => { if (!vis.has(next)) { vis.add(next); status[next][key] = true; q.push(next); } });
            }
        };
        propagate('line', 'dNeutral');
        propagate('neutral', 'dLine');

        // 3.1 Propagate Specific Phases for Motor Logic
        const propagatePhase = (phaseKey, sourcePortId) => {
            const startNodes = components.filter(c => c.componentId === 'ThreePhaseLine' || (c.componentId === 'PowerLine' && phaseKey === 'l1'))
                .map(c => getNodeId(c.id, c.componentId === 'PowerLine' ? 'p1' : sourcePortId));
            const q = [...startNodes], vis = new Set(startNodes);
            startNodes.forEach(s => status[s] && (status[s][phaseKey] = true));
            while (q.length > 0) {
                const curr = q.shift();
                if (status[curr].dNeutral) continue;
                fullGraph[curr].forEach(next => { if (!vis.has(next)) { vis.add(next); status[next][phaseKey] = true; q.push(next); } });
            }
        };
        propagatePhase('l1', 'L1');
        propagatePhase('l2', 'L2');
        propagatePhase('l3', 'L3');

        // Helper for connectivity check
        const areConnected = (id1, id2, graph) => {
            if (id1 === id2) return true;
            if (!graph[id1] || !graph[id2]) return false;
            const q = [id1], vis = new Set([id1]);
            while (q.length > 0) {
                const curr = q.shift();
                for (let next of graph[curr]) {
                    if (next === id2) return true;
                    if (!vis.has(next)) { vis.add(next); q.push(next); }
                }
            }
            return false;
        };

        // 4. Update States
        isShortCircuit = lineSeeds.some(s => status[s].dNeutral);

        const nextWires = wires.map(w => {
            const f = getNodeId(w.from.compId, w.from.portId), t = getNodeId(w.to.compId, w.to.portId);
            if (status[f].line || status[t].line) return { ...w, state: 'line' };
            if (status[f].neutral || status[t].neutral) return { ...w, state: 'neutral' };
            return { ...w, state: 'off' };
        });

        const nextComponents = components.map(comp => {
            const index = comp.tagIndex || 1;
            const prefix = comp.prefix || componentMap[comp.componentId].prefix || "";
            const fullName = prefix + index;
            const isEnergized = poweredTags.has(fullName);

            const portPotentials = {};
            componentMap[comp.componentId].ports.forEach(p => {
                const id = getNodeId(comp.id, p.id);
                portPotentials[p.id] = status[id];
            });

            if (['Lamp', 'Relay', 'Contactor', 'OnDelayTimer'].includes(comp.componentId)) {
                const inId = getNodeId(comp.id, 'in'), outId = getNodeId(comp.id, 'out');
                const isEnergized = (status[inId].line && status[outId].neutral) || (status[inId].neutral && status[outId].line);

                if (comp.componentId === 'OnDelayTimer') {
                    // For Timer, isOn is managed by the external clock loop in Canva.jsx
                    // but we need to tell Canva if it's currently energized to start/stop the timer
                    return {
                        ...comp,
                        portPotentials,
                        timerState: {
                            ...comp.timerState,
                            isEnergized,
                            delay: comp.delay || 1,
                            remainingTime: comp.remainingTime ?? (comp.delay || 1)
                        }
                    };
                }

                return { ...comp, isOn: isEnergized, portPotentials };
            }

            if (comp.componentId === 'SimpleMotor') {
                const uId = getNodeId(comp.id, 'U'), vId = getNodeId(comp.id, 'V'), wId = getNodeId(comp.id, 'W');

                const getPhase = (id) => {
                    if (status[id].l1) return 'L1';
                    if (status[id].l2) return 'L2';
                    if (status[id].l3) return 'L3';
                    return null;
                };

                const pU = getPhase(uId), pV = getPhase(vId), pW = getPhase(wId);
                const has3Phases = new Set([pU, pV, pW].filter(x => x)).size === 3;

                let direction = null;
                if (has3Phases) {
                    const order = [pU, pV, pW].join('');
                    if (['L1L2L3', 'L2L3L1', 'L3L1L2'].includes(order)) direction = 'forward';
                    else direction = 'reverse';
                }

                const isOn = has3Phases;
                return { ...comp, isOn, motorState: { isRunning: isOn, mode: 'star', direction }, portPotentials };
            }

            if (comp.componentId === 'AdvancedMotor') {
                const u1 = getNodeId(comp.id, 'U1'), v1 = getNodeId(comp.id, 'V1'), w1 = getNodeId(comp.id, 'W1');
                const u2 = getNodeId(comp.id, 'U2'), v2 = getNodeId(comp.id, 'V2'), w2 = getNodeId(comp.id, 'W2');

                const getPhase = (id) => {
                    if (status[id].l1) return 'L1';
                    if (status[id].l2) return 'L2';
                    if (status[id].l3) return 'L3';
                    return null;
                };

                const pU1 = getPhase(u1), pV1 = getPhase(v1), pW1 = getPhase(w1);
                const pU2 = getPhase(u2), pV2 = getPhase(v2), pW2 = getPhase(w2);
                
                const distinctPhases = new Set([pU1, pV1, pW1].filter(x => x));
                const has3Phases = distinctPhases.size === 3;
                const bottomHasPhases = pU2 && pV2 && pW2;

                // Detect mode
                let mode = null;
                // Star: U2, V2, W2 are all connected together physically
                const starConnect = areConnected(u2, v2, fullGraph) && areConnected(v2, w2, fullGraph);

                if (has3Phases) {
                    if (starConnect) {
                        mode = 'star';
                    } else if (bottomHasPhases) {
                        // If it's powered at both ends but NOT star, it's Delta
                        mode = 'delta';
                    }
                }

                // Detect direction
                let direction = null;
                if (has3Phases) {
                    const order = [pU1, pV1, pW1].join('');
                    if (['L1L2L3', 'L2L3L1', 'L3L1L2'].includes(order)) direction = 'forward';
                    else direction = 'reverse';
                }

                const isRunning = has3Phases && mode !== null;
                return { ...comp, isOn: isRunning, isRunning, motorState: { isRunning, mode, direction }, portPotentials };
            }

            // For contacts, 'isOn' means 'Energized' (flipped position)
            if (comp.componentId === 'NCContact' || comp.componentId === 'NOContact' || comp.componentId === 'ContactorMainContacts') {
                const prefix = comp.prefix || componentMap[comp.componentId].prefix || "";
                const fullName = prefix + (comp.tagIndex || 1);
                const isCompEnergized = poweredTags.has(fullName);
                return { ...comp, isOn: isCompEnergized, portPotentials };
            }

            if (['PushButtonNC', 'PushButtonNO', 'SinglePoleCB', 'ThreePoleCB'].includes(comp.componentId)) {
                return { ...comp, isOn: comp.isPressed || false, portPotentials };
            }

            return { ...comp, isOn: false, portPotentials };
        });

        // Check for stability
        const resultsChanged = JSON.stringify(nextComponents) !== JSON.stringify(activeComponents);
        activeComponents = nextComponents;
        activeWires = nextWires;

        if (!resultsChanged) break; // Stabilized
    }

    return { activeWires, activeComponents, isShortCircuit };
};
