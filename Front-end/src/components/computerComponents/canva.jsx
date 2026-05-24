import React, { useState, useEffect, useCallback, useRef } from 'react'
import { toPng } from 'html-to-image'
import { FaTrash, FaTimes, FaSave, FaPlay, FaStop } from 'react-icons/fa'
import { componentMap } from '../electrical/components'
import { runSimulation } from '../../logic/engine'

const Canva = ({ isSimulatingProp: isSimulating, setIsSimulatingProp: setIsSimulating, theme, isPreviewMode, setIsPreviewMode, currentProject }) => {
    const [placedComponents, setPlacedComponents] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [draggingId, setDraggingId] = useState(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [simResults, setSimResults] = useState({ activeWires: [], activeComponents: [] })
    const [wires, setWires] = useState([])
    const [activeWire, setActiveWire] = useState(null)
    const [draggingSegment, setDraggingSegment] = useState(null)
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, id: null })
    const [draggingLabelId, setDraggingLabelId] = useState(null)
    const canvasRef = useRef(null)
    const [isInitialized, setIsInitialized] = useState(false)

    // Load circuit from localStorage on mount or project change
    useEffect(() => {
        const savedComponents = localStorage.getItem(`electro_comp_${currentProject}`)
        const savedWires = localStorage.getItem(`electro_wire_${currentProject}`)

        if (savedComponents) {
            try {
                const parsed = JSON.parse(savedComponents);
                setPlacedComponents(parsed)
            } catch (e) {
                console.error("Failed to load components", e)
                setPlacedComponents([])
            }
        } else {
            setPlacedComponents([])
        }

        if (savedWires) {
            try {
                const parsed = JSON.parse(savedWires);
                setWires(parsed)
            } catch (e) {
                console.error("Failed to load wires", e)
                setWires([])
            }
        } else {
            setWires([])
        }
        setIsInitialized(true)
    }, [currentProject])

    // Save to localStorage whenever components or wires change
    useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem(`electro_comp_${currentProject}`, JSON.stringify(placedComponents))
        localStorage.setItem(`electro_wire_${currentProject}`, JSON.stringify(wires))
    }, [placedComponents, wires, currentProject, isInitialized])

    useEffect(() => {
        if (isSimulating) setSelectedId(null)
    }, [isSimulating])

    // Simulation Effect
    useEffect(() => {
        if (isSimulating) {
            const results = runSimulation(placedComponents, wires, componentMap)

            if (results.isShortCircuit) {
                setIsSimulating(false)
                alert("⚠️ Short Circuit Detected! The simulation has been stopped to prevent damage.")
                return
            }

            // Check if simulation state (isOn), energized state, or motor mode has changed
            const currentStates = placedComponents.map(c => ({
                id: c.id,
                isOn: !!c.isOn,
                isEnergized: !!c.timerState?.isEnergized,
                mode: c.motorState?.mode
            }));
            const nextStates = results.activeComponents.map(c => ({
                id: c.id,
                isOn: !!c.isOn,
                isEnergized: !!c.timerState?.isEnergized,
                mode: c.motorState?.mode
            }));

            if (JSON.stringify(currentStates) !== JSON.stringify(nextStates)) {
                setPlacedComponents(results.activeComponents);
            }

            setSimResults(results)
        } else {
            // Only reset if not already reset to prevent infinite loop
            setPlacedComponents(prev => {
                const needsReset = prev.some(c => c.isOn || c.isPressed || (c.componentId === 'OnDelayTimer' && c.remainingTime !== (c.delay || 1)));
                if (!needsReset) return prev;
                
                return prev.map(c => ({
                    ...c,
                    isOn: false,
                    isPressed: false,
                    remainingTime: c.delay || 1
                }));
            });
            setSimResults({ activeWires: [], activeComponents: [] })
        }
    }, [isSimulating, placedComponents, wires]) // eslint-disable-line react-hooks/exhaustive-deps

    // Timer Countdown Loop
    useEffect(() => {
        if (!isSimulating) return;

        const interval = setInterval(() => {
            setPlacedComponents(prev => {
                let hasChanges = false;
                const next = prev.map(comp => {
                    if (comp.componentId === 'OnDelayTimer') {
                        const isEnergized = comp.timerState?.isEnergized;
                        const defaultDelay = comp.delay || 1;

                        if (isEnergized) {
                            if (comp.remainingTime > 0) {
                                hasChanges = true;
                                const newRemaining = Math.max(0, comp.remainingTime - 0.1);
                                return {
                                    ...comp,
                                    remainingTime: newRemaining,
                                    isOn: newRemaining <= 0
                                };
                            }
                        } else {
                            // Reset if power is lost
                            if (comp.remainingTime !== defaultDelay || comp.isOn) {
                                hasChanges = true;
                                return {
                                    ...comp,
                                    remainingTime: defaultDelay,
                                    isOn: false
                                };
                            }
                        }
                    }
                    return comp;
                });
                return hasChanges ? next : prev;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isSimulating]);

    // Handle instant import from custom event
    useEffect(() => {
        const handleImport = (e) => {
            const { components: newComponents, wires: newWires } = e.detail;

            // Ensure all wires have unique IDs if missing, and preserve all routing properties
            const sanitizedWires = (newWires || []).map((w, idx) => ({
                id: w.id || `wire_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
                from: w.from,
                to: w.to,
                midX1: w.midX1,
                midY1: w.midY1,
                midY: w.midY,
                midX2: w.midX2,
                midY2: w.midY2,
                orientation: w.orientation
            }));

            setPlacedComponents(newComponents || []);
            setWires(sanitizedWires);
            setSelectedId(null); // Clear selection to avoid ghost selection
        };

        window.addEventListener('electro_import_circuit', handleImport);
        return () => window.removeEventListener('electro_import_circuit', handleImport);
    }, []);

    // Helper to get port position in canvas space
    const getPortCanvasPos = (component, port) => {
        const rad = (component.rotation || 0) * (Math.PI / 180)
        const cos = Math.cos(rad)
        const sin = Math.sin(rad)
        const rx = port.x * cos - port.y * sin
        const ry = port.x * sin + port.y * cos
        return {
            x: component.x + rx,
            y: component.y + ry
        }
    }

    // Zoom handling with mouse wheel
    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            setZoom(prev => {
                const newZoom = Math.min(Math.max(prev * delta, 0.2), 3)
                return parseFloat(newZoom.toFixed(2))
            })
        }

        const currentCanvas = canvasRef.current
        if (currentCanvas) {
            currentCanvas.addEventListener('wheel', handleWheel, { passive: false })
        }
        return () => {
            if (currentCanvas) {
                currentCanvas.removeEventListener('wheel', handleWheel)
            }
        }
    }, []) // Run only once

    // Delete selected component or wire
    const deleteSelected = useCallback(() => {
        if (isSimulating) return
        if (selectedId) {
            // Check if selected is a component
            const isComp = placedComponents.some(c => c.id === selectedId)
            if (isComp) {
                setPlacedComponents(prev => prev.filter(c => c.id !== selectedId))
                setWires(prev => prev.filter(w => w.from.compId !== selectedId && w.to.compId !== selectedId))
            } else {
                // Otherwise treat as wire
                setWires(prev => prev.filter(w => w.id !== selectedId))
            }
            setSelectedId(null)
        }
    }, [selectedId, placedComponents, isSimulating])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete') {
                deleteSelected()
                setContextMenu({ ...contextMenu, visible: false })
            }
            if (e.key === 'Escape') {
                setContextMenu({ ...contextMenu, visible: false })
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [deleteSelected, contextMenu, activeWire])

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDrop = (e) => {
        if (isSimulating) return
        e.preventDefault()
        const componentId = e.dataTransfer.getData("componentId")
        if (!componentId) return

        const rect = canvasRef.current.getBoundingClientRect()
        // Adjust for zoom and pan
        let x = (e.clientX - rect.left - pan.x) / zoom
        let y = (e.clientY - rect.top - pan.y) / zoom

        // Snapping based on the first port to ensure straight wires
        const metadata = componentMap[componentId]
        const firstPort = metadata.ports[0] || { x: 0, y: 0 }

        // Adjust x and y so the first port hits the grid
        x = Math.round((x + firstPort.x) / 10) * 10 - firstPort.x
        y = Math.round((y + firstPort.y) / 10) * 10 - firstPort.y        // Calculate next tagIndex based on MAX existing number to prevent "going back"
        const prefix = metadata.prefix || ""
        const secondaryTypes = ['NCContact', 'NOContact', 'ContactorMainContacts', 'OverloadContact', 'TimerNC', 'TimerNO'];
        const isCurrentSecondary = secondaryTypes.includes(componentId);

        // Filter components that share the same prefix AND the same classification (Primary vs Secondary)
        const relevantIndices = placedComponents
            .filter(c => {
                const cPrefix = c.prefix || componentMap[c.componentId].prefix;
                const isCSecondary = secondaryTypes.includes(c.componentId);
                return cPrefix === prefix && isCSecondary === isCurrentSecondary;
            })
            .map(c => c.tagIndex || 0);

        const maxIndex = relevantIndices.length > 0 ? Math.max(...relevantIndices) : 0;
        const nextIndex = maxIndex + 1;

        const newComponent = {
            id: Date.now().toString(),
            componentId,
            x,
            y,
            rotation: 0,
            tagIndex: nextIndex,
            label: "",
            labelOffset: { x: -60, y: 0 },
            delay: componentId === 'OnDelayTimer' ? 1 : undefined,
            remainingTime: componentId === 'OnDelayTimer' ? 1 : undefined
        }

        setPlacedComponents([...placedComponents, newComponent])
        setSelectedId(newComponent.id)
    }

    const startAction = (e) => {
        setContextMenu({ ...contextMenu, visible: false })
        if (e.button !== 0) return

        // Always allow panning
        if (e.target === canvasRef.current || e.target.id === 'panning-surface') {
            if (!isSimulating) {
                setSelectedId(null)
                if (activeWire) {
                    setActiveWire(null)
                    return
                }
            }
            setIsPanning(true)
            setDragOffset({ x: e.clientX - pan.x, y: e.clientY - pan.y })
            return
        }

        if (isSimulating) return
    }

    const startWiring = (e, compId, port) => {
        if (isSimulating) return
        e.stopPropagation()
        e.preventDefault()

        // If we are already wiring, this might be the end point (for click-click mode)
        if (activeWire) {
            endWiring(e, compId, port)
            return
        }

        const component = placedComponents.find(c => c.id === compId)
        const pos = getPortCanvasPos(component, port)
        setActiveWire({
            from: { compId, portId: port.id, ...pos },
            to: { x: pos.x, y: pos.y }
        })
    }

    const endWiring = (e, compId, port) => {
        if (isSimulating) return
        e.stopPropagation()
        if (!activeWire) return

        const targetComp = placedComponents.find(c => c.id === compId)
        const finalEndPos = getPortCanvasPos(targetComp, port)

        // Check for alignment to auto-straighten
        const isVerticallyAligned = Math.abs(activeWire.from.x - finalEndPos.x) < 2
        const isHorizontallyAligned = Math.abs(activeWire.from.y - finalEndPos.y) < 2

        const newWire = {
            id: Date.now().toString(),
            from: activeWire.from,
            to: { compId, portId: port.id },
            // Use actual port position for midpoints
            midY1: activeWire.from.y,
            midX1: isVerticallyAligned ? finalEndPos.x : activeWire.from.x,
            midY: (activeWire.from.y + finalEndPos.y) / 2,
            midX2: finalEndPos.x,
            midY2: isHorizontallyAligned ? activeWire.from.y : finalEndPos.y
        }

        // If perfectly aligned, ensure midY is also handled or path is simplified
        if (isVerticallyAligned) {
            newWire.midX1 = finalEndPos.x;
            newWire.midX2 = finalEndPos.x;
        }
        if (isHorizontallyAligned) {
            newWire.midY1 = finalEndPos.y;
            newWire.midY = finalEndPos.y;
            newWire.midY2 = finalEndPos.y;
        }

        setWires([...wires, newWire])
        setActiveWire(null)
    }

    const startDraggingSegment = (e, wireId, axis, subKey = '') => {
        if (isSimulating) return
        e.stopPropagation()
        setDraggingSegment({ wireId, axis, subKey })
    }

    const handleContextMenu = (e, id) => {
        if (isSimulating) {
            e.preventDefault()
            return
        }
        e.preventDefault()
        e.stopPropagation()
        setSelectedId(id)

        // Prevent menu from going off-screen (flip if near bottom/right)
        const menuWidth = 224; // Width of w-56
        const menuHeight = 300; // Estimated height
        let x = e.clientX;
        let y = e.clientY;

        if (x + menuWidth > window.innerWidth) x -= menuWidth;
        if (y + menuHeight > window.innerHeight) y -= menuHeight;

        setContextMenu({
            visible: true,
            x: x,
            y: y,
            id: id
        })
    }

    const rotateComponent = (deg) => {
        if (isSimulating) return
        setPlacedComponents(prev => prev.map(c =>
            c.id === contextMenu.id ? { ...c, rotation: (c.rotation + deg) % 360 } : c
        ))
        setContextMenu({ ...contextMenu, visible: false })
    }

    const handleSaveImage = () => {
        const canvasElement = document.querySelector('.canvas-container');
        if (!canvasElement) {
            alert("Canvas container not found!");
            return;
        }

        const now = new Date();
        const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
        const timeStr = `${now.getHours() > 12 ? now.getHours() - 12 : now.getHours()}-${now.getMinutes() >= 10 ? now.getMinutes() : '0' + now.getMinutes()}-${now.getSeconds() >= 10 ? now.getSeconds() : '0' + now.getSeconds()}-${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        const fileName = `${currentProject}_${dateStr}_${timeStr}.png`;

        toPng(canvasElement, {
            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
            cacheBust: true,
            pixelRatio: 3,
            filter: (node) => {
                // Filter out UI controls and AI chat if they are inside the container
                const classesToHide = ['canvas-controls', 'zoom-bar-container', 'ai-chat-container', 'preview-overlay-buttons'];
                if (node.classList) {
                    return !classesToHide.some(cls => node.classList.contains(cls));
                }
                return true;
            }
        })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = fileName;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Save failed:', err);
                alert("Capture failed. Please try again.");
            });
    };

    const startMoving = (e, item) => {
        if (isSimulating || activeWire) return // Don't move while wiring or simulating
        e.stopPropagation()
        setContextMenu({ ...contextMenu, visible: false })
        setSelectedId(item.id)
        setDraggingId(item.id)

        const rect = canvasRef.current.getBoundingClientRect()
        const canvasX = (e.clientX - rect.left - pan.x) / zoom
        const canvasY = (e.clientY - rect.top - pan.y) / zoom

        setDragOffset({
            x: canvasX - item.x,
            y: canvasY - item.y
        })
    }

    const onMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect()
        const canvasX = (e.clientX - rect.left - pan.x) / zoom
        const canvasY = (e.clientY - rect.top - pan.y) / zoom

        if (activeWire) {
            setActiveWire({
                ...activeWire,
                to: { x: canvasX, y: canvasY }
            })
        } else if (draggingSegment) {
            const { wireId, axis, subKey } = draggingSegment
            setWires(prev => prev.map(w => {
                if (w.id === wireId) {
                    const snapped = Math.round((axis === 'x' ? canvasX : canvasY) / 10) * 10
                    const key = subKey || (axis === 'x' ? 'midX1' : 'midY')
                    return { ...w, [key]: snapped }
                }
                return w
            }))
            return
        } else if (draggingId) {
            const item = placedComponents.find(c => c.id === draggingId)
            const metadata = componentMap[item.componentId]
            const firstPort = metadata.ports[0] || { x: 0, y: 0 }

            let newX = Math.round((canvasX - dragOffset.x + firstPort.x) / 10) * 10 - firstPort.x
            let newY = Math.round((canvasY - dragOffset.y + firstPort.y) / 10) * 10 - firstPort.y

            if (newX !== item.x || newY !== item.y) {
                const dx = newX - item.x;
                const dy = newY - item.y;

                // Update connected wires to maintain relative shape and auto-straighten
                const currentComps = new Map(placedComponents.map(c => [c.id, c]));
                setWires(prev => prev.map(w => {
                    if (w.from.compId === draggingId || w.to.compId === draggingId) {
                        const nextWire = { ...w };
                        const isFrom = w.from.compId === draggingId;
                        const otherCompId = isFrom ? w.to.compId : w.from.compId;
                        const otherComp = currentComps.get(otherCompId);

                        if (!otherComp) return w;

                        // Calculate current positions to check for alignment
                        const fromPort = componentMap[isFrom ? item.componentId : otherComp.componentId].ports.find(p => p.id === w.from.portId);
                        const toPort = componentMap[isFrom ? otherComp.componentId : item.componentId].ports.find(p => p.id === w.to.portId);

                        const startPos = getPortCanvasPos(isFrom ? { ...item, x: newX, y: newY } : otherComp, fromPort);
                        const endPos = getPortCanvasPos(isFrom ? otherComp : { ...item, x: newX, y: newY }, toPort);

                        if (w.midY !== undefined) nextWire.midY = w.midY + dy;

                        if (isFrom) {
                            if (w.midX1 !== undefined) nextWire.midX1 = w.midX1 + dx;
                            if (w.midY1 !== undefined) nextWire.midY1 = w.midY1 + dy;
                        } else {
                            if (w.midX2 !== undefined) nextWire.midX2 = w.midX2 + dx;
                            if (w.midY2 !== undefined) nextWire.midY2 = w.midY2 + dy;
                        }

                        return nextWire;
                    }
                    return w;
                }));

                setPlacedComponents(prev => prev.map(c =>
                    c.id === draggingId ? { ...c, x: newX, y: newY } : c
                ))
            }
        } else if (isPanning) {
            setPan({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            })
        }
    }

    const stopAction = () => {
        setDraggingId(null)
        setIsPanning(false)
        setDraggingSegment(null)
    }

    return (
        <div
            ref={canvasRef}
            className={`grow relative overflow-hidden bg-(--bg-primary) select-none outline-none canvas-container ${isPanning ? 'cursor-grabbing' : 'cursor-default'} ${activeWire ? 'cursor-crosshair' : ''}`}
            tabIndex="0"
            style={{
                minHeight: 'calc(100vh - 50px)'
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseDown={startAction}
            onMouseMove={onMouseMove}
            onMouseUp={stopAction}
            onMouseLeave={stopAction}
        >
            {/* Infinite-like Grid Background */}
            <div
                id="panning-surface"
                className="absolute inset-0 transition-all duration-300"
                style={{
                    backgroundImage: `radial-gradient(${theme === 'dark' ? '#334155' : '#e5e7eb'} 1px, transparent 1px)`,
                    backgroundSize: `${15 * zoom}px ${15 * zoom}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`
                }}
            />

            <div style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0'
            }}>
                {/* Wires Layer */}
                <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: 1, height: 1 }}>
                    {wires.map(wire => {
                        const fromComp = placedComponents.find(c => c.id === wire.from.compId)
                        const toComp = placedComponents.find(c => c.id === wire.to.compId)
                        if (!fromComp || !toComp) return null

                        const fromPort = componentMap[fromComp.componentId].ports.find(p => p.id === wire.from.portId)
                        const toPort = componentMap[toComp.componentId].ports.find(p => p.id === wire.to.portId)

                        const start = getPortCanvasPos(fromComp, fromPort)
                        const end = getPortCanvasPos(toComp, toPort)

                        const isWireSelected = selectedId === wire.id
                        const simWire = simResults.activeWires.find(w => w.id === wire.id)

                        // Simulation colors
                        let strokeColor = isWireSelected ? "#0ea5e9" : (theme === 'dark' ? '#ffffff' : '#000000')
                        if (isSimulating && simWire) {
                            if (simWire.state === 'line') strokeColor = "#ef4444" // Red
                            else if (simWire.state === 'neutral') strokeColor = "#2563eb" // Blue (distinct from selection)
                        }

                        const midY1 = wire.midY1 !== undefined ? wire.midY1 : start.y
                        const midX1 = wire.midX1 !== undefined ? wire.midX1 : start.x
                        const midY = wire.midY !== undefined ? wire.midY : (start.y + end.y) / 2
                        const midX2 = wire.midX2 !== undefined ? wire.midX2 : end.x
                        const midY2 = wire.midY2 !== undefined ? wire.midY2 : end.y

                        // Ultimate 7-segment path: 
                        // (start) -> (start.x, midY1) -> (midX1, midY1) -> (midX1, midY) -> (midX2, midY) -> (midX2, midY2) -> (end.x, midY2) -> (end)
                        const points = `${start.x},${start.y} ${start.x},${midY1} ${midX1},${midY1} ${midX1},${midY} ${midX2},${midY} ${midX2},${midY2} ${end.x},${midY2} ${end.x},${end.y}`

                        return (
                            <g key={wire.id} className={`pointer-events-auto ${!isSimulating ? 'cursor-pointer' : ''}`} onClick={(e) => {
                                if (isSimulating) return
                                e.stopPropagation()
                                setSelectedId(wire.id)
                            }}>
                                <polyline points={points} fill="none" stroke="transparent" strokeWidth="12" />
                                <polyline
                                    points={points}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="1"
                                    strokeLinecap="butt"
                                    strokeLinejoin="miter"
                                    className="transition-colors duration-300"
                                    style={{
                                        shapeRendering: 'geometricPrecision',
                                        mixBlendMode: theme === 'dark' ? 'lighten' : 'darken'
                                    }}
                                />

                                {isWireSelected && !isSimulating && (
                                    <g>
                                        {/* Start Horizontal Handle (Y1) */}
                                        <g onMouseDown={(e) => startDraggingSegment(e, wire.id, 'y', 'midY1')} className="cursor-ns-resize">
                                            <line x1={start.x} y1={midY1} x2={midX1} y2={midY1} stroke="#0ea5e9" strokeWidth="6" strokeOpacity="0.2" strokeLinecap="round" />
                                            <line x1={start.x} y1={midY1} x2={midX1} y2={midY1} stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="3,1" />
                                        </g>
                                        {/* Start Vertical Handle (X1) */}
                                        <g onMouseDown={(e) => startDraggingSegment(e, wire.id, 'x', 'midX1')} className="cursor-ew-resize">
                                            <line x1={midX1} y1={midY1} x2={midX1} y2={midY} stroke="#0ea5e9" strokeWidth="6" strokeOpacity="0.2" strokeLinecap="round" />
                                            <line x1={midX1} y1={midY1} x2={midX1} y2={midY} stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="3,1" />
                                        </g>
                                        {/* Middle Horizontal Handle (Y) */}
                                        <g onMouseDown={(e) => startDraggingSegment(e, wire.id, 'y')} className="cursor-ns-resize">
                                            <line x1={midX1} y1={midY} x2={midX2} y2={midY} stroke="#0ea5e9" strokeWidth="6" strokeOpacity="0.2" strokeLinecap="round" />
                                            <line x1={midX1} y1={midY} x2={midX2} y2={midY} stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="3,1" />
                                        </g>
                                        {/* End Vertical Handle (X2) */}
                                        <g onMouseDown={(e) => startDraggingSegment(e, wire.id, 'x', 'midX2')} className="cursor-ew-resize">
                                            <line x1={midX2} y1={midY} x2={midX2} y2={midY2} stroke="#0ea5e9" strokeWidth="6" strokeOpacity="0.2" strokeLinecap="round" />
                                            <line x1={midX2} y1={midY} x2={midX2} y2={midY2} stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="3,1" />
                                        </g>
                                        {/* End Horizontal Handle (Y2) */}
                                        <g onMouseDown={(e) => startDraggingSegment(e, wire.id, 'y', 'midY2')} className="cursor-ns-resize">
                                            <line x1={midX2} y1={midY2} x2={end.x} y2={midY2} stroke="#0ea5e9" strokeWidth="6" strokeOpacity="0.2" strokeLinecap="round" />
                                            <line x1={midX2} y1={midY2} x2={end.x} y2={midY2} stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="3,1" />
                                        </g>
                                    </g>
                                )}
                            </g>
                        )
                    })}

                    {/* Active Wire Preview */}
                    {activeWire && (
                        <polyline
                            points={`${activeWire.from.x},${activeWire.from.y} ${activeWire.from.x},${activeWire.to.y} ${activeWire.to.x},${activeWire.to.y}`}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2"
                            strokeDasharray="4"
                            strokeLinecap="butt"
                            strokeLinejoin="miter"
                        />
                    )}

                    {/* Alignment Guides (Main Axis & Ports) */}
                    {!isSimulating && selectedId && (() => {
                        const selectedComp = placedComponents.find(c => c.id === selectedId);
                        if (!selectedComp) return null;
                        const { ports } = componentMap[selectedComp.componentId];

                        return (
                            <g pointerEvents="none">
                                {/* Main Center Axis (Solid) */}
                                <line
                                    x1={selectedComp.x} y1="-10000"
                                    x2={selectedComp.x} y2="10000"
                                    stroke="#3b82f6"
                                    strokeWidth="1"
                                    opacity="0.5"
                                />
                                <line
                                    x1="-10000" y1={selectedComp.y}
                                    x2="10000" y2={selectedComp.y}
                                    stroke="#3b82f6"
                                    strokeWidth="1"
                                    opacity="0.5"
                                />

                                {/* Port Axes (Dashed) */}
                                {ports.map(port => {
                                    const pos = getPortCanvasPos(selectedComp, port);
                                    return (
                                        <g key={port.id} opacity="0.4">
                                            <line
                                                x1={pos.x} y1="-10000"
                                                x2={pos.x} y2="10000"
                                                stroke="#3b82f6"
                                                strokeWidth="1"
                                                strokeDasharray="5,3"
                                            />
                                            <line
                                                x1="-10000" y1={pos.y}
                                                x2="10000" y2={pos.y}
                                                stroke="#3b82f6"
                                                strokeWidth="1"
                                                strokeDasharray="5,3"
                                            />
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })()}
                </svg>

                {placedComponents.map((item) => {
                    const { Component, ports } = componentMap[item.componentId]
                    const isSelected = selectedId === item.id
                    const simComp = simResults.activeComponents.find(c => c.id === item.id)
                    const isPowered = isSimulating && simComp?.isOn
                    const portPotentials = simComp?.portPotentials || {}

                    // Determine component color based on theme and state
                    let compColor = theme === 'dark' ? '#ffffff' : '#000000' // Pure white/black contrast
                    if (isSelected) compColor = "#0ea5e9" // Light Blue selection
                    else if (isSimulating) {
                        const isContactOrButton = ['NCContact', 'NOContact', 'PushButtonNC', 'PushButtonNO'].includes(item.componentId);
                        if (item.componentId === 'PowerLine' || item.componentId === 'ThreePhaseLine') compColor = "#ef4444" // Red
                        else if (item.componentId === 'Nutral') compColor = "#2563eb" // Blue
                        else if (isPowered && !isContactOrButton && item.componentId !== 'Lamp') compColor = "#fbbf24" // Yellow for loads
                    }

                    return (
                        <div
                            key={item.id}
                            className={`absolute ${!isSimulating ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            style={{
                                left: item.x,
                                top: item.y,
                                transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
                                zIndex: isSelected ? 10 : 1,
                                transition: draggingId === item.id ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseDown={(e) => {
                                if (isSimulating) {
                                    if (item.componentId === 'PushButtonNC' || item.componentId === 'PushButtonNO') {
                                        setPlacedComponents(prev => prev.map(c =>
                                            c.id === item.id ? { ...c, isPressed: true } : c
                                        ))
                                    }
                                    return
                                }
                                startMoving(e, item)
                            }}
                            onMouseUp={() => {
                                if (isSimulating && (item.componentId === 'PushButtonNC' || item.componentId === 'PushButtonNO')) {
                                    setPlacedComponents(prev => prev.map(c =>
                                        c.id === item.id ? { ...c, isPressed: false } : c
                                    ))
                                }
                            }}
                            onMouseLeave={() => {
                                if (isSimulating && (item.componentId === 'PushButtonNC' || item.componentId === 'PushButtonNO')) {
                                    setPlacedComponents(prev => prev.map(c =>
                                        c.id === item.id ? { ...c, isPressed: false } : c
                                    ))
                                }
                            }}
                            onContextMenu={(e) => handleContextMenu(e, item.id)}
                            onClick={(e) => {
                                if (isSimulating) {
                                    if (item.componentId === 'SinglePoleCB' || item.componentId === 'ThreePoleCB') {
                                        setPlacedComponents(prev => prev.map(c =>
                                            c.id === item.id ? { ...c, isPressed: !c.isPressed } : c
                                        ))
                                    }
                                    return
                                }
                                e.stopPropagation()
                                setSelectedId(item.id)
                            }}
                        >
                            <Component
                                color={compColor}
                                isOn={isPowered}
                                portPotentials={portPotentials}
                                isSimulating={isSimulating}
                                isSelected={isSelected}
                                motorState={simComp?.motorState}
                                timerState={simComp?.timerState || {
                                    delay: item.delay || 1,
                                    remainingTime: item.remainingTime ?? (item.delay || 1),
                                    isEnergized: false
                                }}
                                prefix={item.prefix || componentMap[item.componentId].prefix}
                                bulbColor={item.bulbColor || 'red'}
                            />

                            {/* Properties (Tag & Label) - Vertical Alignment (Fixed Position) */}
                            {componentMap[item.componentId].showProperties && (
                                <div
                                    className={`absolute whitespace-nowrap flex flex-col items-center gap-1.5 pointer-events-none`}
                                    style={{
                                        // Use static offset from componentMap or default to -60px (left side)
                                        left: `calc(50% + ${componentMap[item.componentId].labelOffset?.x || -60}px)`,
                                        top: `calc(50% + ${componentMap[item.componentId].labelOffset?.y || 0}px)`,
                                        transform: 'translate(-50%, -50%) rotate(-90deg)',
                                        zIndex: 30
                                    }}
                                >
                                    <div className="flex flex-col items-center gap-1.5">
                                        {/* Tag Indicator - Larger Font */}
                                        {item.componentId !== 'Lamp' && (
                                            <div className="w-min bg-(--text-primary) text-(--bg-primary) text-[18px] font-black px-3 py-1 rounded-sm shadow-md tracking-widest">
                                                {item.prefix || componentMap[item.componentId].prefix || ""}{item.tagIndex || 1}
                                            </div>
                                        )}
                                        {item.label && (
                                            <div className="text-[18px] text-(--text-secondary) font-extrabold tracking-tight">
                                                {item.label}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Ports Rendering */}
                            {!isSimulating && ports.map(port => (
                                <div
                                    key={port.id}
                                    className="absolute w-2 h-2 bg-[var(--card-bg)] border border-(--text-primary) hover:border-blue-500 transition-all z-20 cursor-crosshair rounded-sm"
                                    style={{ left: `calc(50% + ${port.x}px)`, top: `calc(50% + ${port.y}px)`, transform: 'translate(-50%, -50%)' }}
                                    onMouseDown={(e) => startWiring(e, item.id, port)}
                                    onMouseUp={(e) => {
                                        // Allow dropping wire on port to complete
                                        if (activeWire && activeWire.from.compId !== item.id) {
                                            endWiring(e, item.id, port)
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )
                })}
            </div>

            {/* Simulation Controls moved to Header */}

            {/* Context Menu (existing) */}

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="fixed bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl rounded-xl py-2 w-56 z-[100] animate-in fade-in zoom-in duration-100"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Property Editor Section */}
                    {(() => {
                        const targetComp = placedComponents.find(c => c.id === contextMenu.id);
                        if (!targetComp || !componentMap[targetComp.componentId].showProperties) return null;

                        const prefix = componentMap[targetComp.componentId].prefix;

                        return (
                            <div className="px-3 pb-3 border-b border-[var(--border-color)] mb-2">
                                <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">Properties</div>

                                {/* Lamp Color Selection */}
                                {targetComp.componentId === 'Lamp' && (
                                    <div className="flex flex-col gap-2 mb-3">
                                        <label className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">Lamp Color</label>
                                        <div className="flex gap-2">
                                            {['red', 'green', 'blue', 'yellow'].map(color => (
                                                <button
                                                    key={color}
                                                    className={`w-6 h-6 rounded-full border transition-all ${targetComp.bulbColor === color || (!targetComp.bulbColor && color === 'red') ? 'border-black scale-120 shadow-md' : 'border-transparent'}`}
                                                    style={{
                                                        backgroundColor: color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : color === 'blue' ? '#3b82f6' : '#fbbf24'
                                                    }}
                                                    onClick={() => {
                                                        setPlacedComponents(prev => prev.map(c =>
                                                            c.id === targetComp.id ? { ...c, bulbColor: color } : c
                                                        ))
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {targetComp.componentId !== 'PowerLine' && targetComp.componentId !== 'Nutral' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        {/* Only allow type toggle for contacts, not Relay/Contactor directly */}
                                        {(targetComp.componentId === 'NCContact' || targetComp.componentId === 'NOContact') && (
                                            <div className="flex flex-col gap-0.5">
                                                <label className="text-[9px] text-[var(--text-secondary)] font-bold uppercase text-center">Tag</label>
                                                <button
                                                    className="w-10 h-8 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-xs font-black text-blue-500 hover:bg-blue-500/10 transition-colors shadow-sm"
                                                    onClick={() => {
                                                        const current = targetComp.prefix || "R";
                                                        const next = current === 'R' ? 'K' : current === 'K' ? 'T' : 'R';
                                                        setPlacedComponents(prev => prev.map(c =>
                                                            c.id === targetComp.id ? { ...c, prefix: next } : c
                                                        ))
                                                    }}
                                                >
                                                    {targetComp.prefix || "R"}
                                                </button>
                                            </div>
                                        )}

                                        {/* Hide index logic for Lamp */}
                                        {targetComp.componentId !== 'Lamp' && (
                                            <div className="flex flex-col gap-0.5 grow">
                                                <label className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">Index</label>
                                                <div className="flex border border-[var(--border-color)] rounded-lg overflow-hidden grow">
                                                    <button
                                                        className="px-2 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors border-r border-[var(--border-color)]"
                                                        onClick={() => {
                                                            const newIndex = Math.max(1, (targetComp.tagIndex || 1) - 1);
                                                            const prefix = targetComp.prefix || componentMap[targetComp.componentId].prefix || "";
                                                            const secondaryTypes = ['NCContact', 'NOContact', 'ContactorMainContacts'];
                                                            const isSecondary = secondaryTypes.includes(targetComp.componentId);

                                                            // Only block if it's a Primary component and the index is taken by another Primary
                                                            const isTaken = !isSecondary && placedComponents.some(c =>
                                                                c.id !== targetComp.id &&
                                                                !secondaryTypes.includes(c.componentId) &&
                                                                (c.prefix || componentMap[c.componentId].prefix) === prefix &&
                                                                (c.tagIndex || 1) === newIndex
                                                            );

                                                            if (!isTaken) {
                                                                setPlacedComponents(prev => prev.map(c =>
                                                                    c.id === targetComp.id ? { ...c, tagIndex: newIndex } : c
                                                                ))
                                                            }
                                                        }}
                                                    >-</button>
                                                    <div className="grow text-center py-1 text-sm font-mono font-bold bg-[var(--bg-primary)] text-[var(--text-primary)]">
                                                        {targetComp.tagIndex || 1}
                                                    </div>
                                                    <button
                                                        className="px-2 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors border-l border-[var(--border-color)]"
                                                        onClick={() => {
                                                            const newIndex = (targetComp.tagIndex || 1) + 1;
                                                            const prefix = targetComp.prefix || componentMap[targetComp.componentId].prefix || "";
                                                            const secondaryTypes = ['NCContact', 'NOContact', 'ContactorMainContacts'];
                                                            const isSecondary = secondaryTypes.includes(targetComp.componentId);

                                                            // Only block if it's a Primary component and the index is taken by another Primary
                                                            const isTaken = !isSecondary && placedComponents.some(c =>
                                                                c.id !== targetComp.id &&
                                                                !secondaryTypes.includes(c.componentId) &&
                                                                (c.prefix || componentMap[c.componentId].prefix) === prefix &&
                                                                (c.tagIndex || 1) === newIndex
                                                            );

                                                            if (!isTaken) {
                                                                setPlacedComponents(prev => prev.map(c =>
                                                                    c.id === targetComp.id ? { ...c, tagIndex: newIndex } : c
                                                                ))
                                                            }
                                                        }}
                                                    >+</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Timer Delay Editor */}
                                        {targetComp.componentId === 'OnDelayTimer' && (
                                            <div className="flex flex-col gap-0.5 grow">
                                                <label className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">Delay (s)</label>
                                                <div className="flex border border-[var(--border-color)] rounded-lg overflow-hidden grow">
                                                    <button
                                                        className="px-2 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors border-r border-[var(--border-color)]"
                                                        onClick={() => {
                                                            setPlacedComponents(prev => prev.map(c =>
                                                                c.id === targetComp.id ? {
                                                                    ...c,
                                                                    delay: Math.max(1, (c.delay || 1) - 1),
                                                                    remainingTime: Math.max(1, (c.delay || 1) - 1)
                                                                } : c
                                                            ))
                                                        }}
                                                    >-</button>
                                                    <div className="grow text-center py-1 text-sm font-mono font-bold bg-[var(--bg-primary)] text-[var(--text-primary)]">
                                                        {targetComp.delay || 1}
                                                    </div>
                                                    <button
                                                        className="px-2 bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-colors border-l border-[var(--border-color)]"
                                                        onClick={() => {
                                                            setPlacedComponents(prev => prev.map(c =>
                                                                c.id === targetComp.id ? {
                                                                    ...c,
                                                                    delay: (c.delay || 1) + 1,
                                                                    remainingTime: (c.delay || 1) + 1
                                                                } : c
                                                            ))
                                                        }}
                                                    >+</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-[var(--text-secondary)] font-bold ml-1">{targetComp.componentId === 'Lamp' ? 'LAMP NAME' : 'LABEL'}</label>
                                    <input
                                        type="text"
                                        className="w-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500 transition-colors"
                                        placeholder={targetComp.componentId === 'Lamp' ? 'Run Lamp, Stop Lamp...' : "Add comment..."}
                                        value={targetComp.label || ""}
                                        onChange={(e) => {
                                            setPlacedComponents(prev => prev.map(c =>
                                                c.id === targetComp.id ? { ...c, label: e.target.value } : c
                                            ))
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })()}

                    <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-500/10 text-[var(--text-primary)] hover:text-blue-500 text-sm font-medium transition-colors flex items-center gap-2"
                        onClick={() => rotateComponent(90)}
                    >
                        <span className="opacity-50">↻</span> Rotate 90°
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-500/10 text-[var(--text-primary)] hover:text-blue-500 text-sm font-medium transition-colors flex items-center gap-2"
                        onClick={() => rotateComponent(180)}
                    >
                        <span className="opacity-50">⇄</span> Rotate 180°
                    </button>
                    {/* Flip orientation option for wires */}
                    {wires.some(w => w.id === contextMenu.id) && (
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-blue-500/10 text-[var(--text-primary)] hover:text-blue-500 text-sm font-medium transition-colors flex items-center gap-2"
                            onClick={() => {
                                setWires(prev => prev.map(w => {
                                    if (w.id === contextMenu.id) {
                                        const newOrientation = w.orientation === 'vertical' ? 'horizontal' : 'vertical';
                                        return {
                                            ...w,
                                            orientation: newOrientation,
                                            midX: newOrientation === 'vertical' ? (getPortCanvasPos(placedComponents.find(c => c.id === w.from.compId), componentMap[placedComponents.find(c => c.id === w.from.compId).componentId].ports.find(p => p.id === w.from.portId)).x + getPortCanvasPos(placedComponents.find(c => c.id === w.to.compId), componentMap[placedComponents.find(c => c.id === w.to.compId).componentId].ports.find(p => p.id === w.to.portId)).x) / 2 : undefined,
                                            midY: newOrientation === 'horizontal' ? (getPortCanvasPos(placedComponents.find(c => c.id === w.from.compId), componentMap[placedComponents.find(c => c.id === w.from.compId).componentId].ports.find(p => p.id === w.from.portId)).y + getPortCanvasPos(placedComponents.find(c => c.id === w.to.compId), componentMap[placedComponents.find(c => c.id === w.to.compId).componentId].ports.find(p => p.id === w.to.portId)).y) / 2 : undefined
                                        }
                                    }
                                    return w;
                                }))
                                setContextMenu({ ...contextMenu, visible: false })
                            }}
                        >
                            <span className="opacity-50">⇄</span> Flip Orientation
                        </button>
                    )}
                    <div className="h-px bg-(--border-color) my-1" />
                    <button
                        className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-500 text-sm font-medium transition-colors flex items-center gap-2"
                        onClick={deleteSelected}
                    >
                        <span className="opacity-50">🗑</span> Delete Component
                    </button>
                </div>
            )}

            {/* Zoom Control Bar & Clear All - Hidden in Preview */}
            {!isPreviewMode && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[45] canvas-controls">
                    {/* Zoom Controls */}
                    <div className="flex items-center bg-(--card-bg) border border-(--border-color) shadow-xl rounded-xl px-3 py-1.5 gap-3 transition-all duration-300 zoom-bar-container">
                        <button
                            onClick={() => setZoom(prev => Math.max(0.2, parseFloat((prev - 0.1).toFixed(2))))}
                            className="w-7 h-7 flex items-center justify-center hover:bg-(--bg-secondary) rounded-lg text-sm font-bold transition-colors border border-(--border-color) text-(--text-primary)"
                        >
                            −
                        </button>

                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0.2"
                                max="3"
                                step="0.01"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="text-[9px] font-bold text-(--text-secondary) font-mono min-w-[35px]">
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>

                        <button
                            onClick={() => setZoom(prev => Math.min(3, parseFloat((prev + 0.1).toFixed(2))))}
                            className="w-7 h-7 flex items-center justify-center hover:bg-(--bg-secondary) rounded-lg text-sm font-bold transition-colors border border-(--border-color) text-(--text-primary)"
                        >
                            +
                        </button>
                    </div>

                    {/* Clear All Button - Separated */}
                    <button
                        onClick={() => {
                            if (window.confirm(theme === 'dark' ? "هل تريد مسح اللوحة بالكامل؟" : "Are you sure you want to clear the entire canvas?")) {
                                setPlacedComponents([]);
                                setWires([]);
                                setSelectedId(null);
                            }
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-(--card-bg) text-red-500 rounded-xl transition-all active:scale-90 border border-(--border-color) shadow-xl group cursor-pointer hover:border-red-500 hover:scale-110 transition-transform duration-300"
                        title="Clear All"
                    >
                        <FaTrash className="text-sm" />
                    </button>
                </div>
            )}

            {/* Preview Mode Controls */}
            {isPreviewMode && (
                <div className="fixed top-6 right-6 flex items-center gap-3 z-[100] preview-overlay-buttons">
                    {/* Run/Stop in Preview */}
                    <button
                        onClick={() => setIsSimulating(!isSimulating)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-95 shadow-2xl backdrop-blur-xl border ${isSimulating
                            ? 'bg-red-500/20 text-red-600 border-red-500/30 hover:bg-red-500 hover:text-white'
                            : 'bg-green-500/80 text-white border-green-500/50 hover:bg-green-600 shadow-green-500/20'
                            }`}
                    >
                        {isSimulating ? <FaStop /> : <FaPlay />}
                        {isSimulating ? 'STOP' : 'RUN'}
                    </button>

                    {/* Save Image in Preview */}
                    <button
                        onClick={handleSaveImage}
                        className="p-4 bg-[var(--bg-secondary)]/80 text-[var(--text-primary)] hover:bg-blue-600 hover:text-white rounded-2xl backdrop-blur-xl border border-[var(--border-color)] transition-all shadow-2xl active:scale-90"
                        title="Save as Image"
                    >
                        <FaSave className="text-xl" />
                    </button>

                    {/* Exit Preview */}
                    <button
                        onClick={() => setIsPreviewMode(false)}
                        className="p-4 bg-[var(--bg-secondary)]/80 text-[var(--text-primary)] hover:bg-red-500 hover:text-white rounded-2xl backdrop-blur-xl border border-[var(--border-color)] transition-all group shadow-2xl active:scale-90"
                        title="Exit Preview"
                    >
                        <FaTimes className="text-xl group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    )
}

export default Canva