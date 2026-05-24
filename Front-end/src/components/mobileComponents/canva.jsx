import React, { useState, useEffect, useCallback, useRef } from 'react'
import { componentMap } from '../electrical/components'
import { runSimulation } from '../../logic/engine'

const Canva = ({ 
    isSimulatingProp: isSimulating, 
    setIsSimulatingProp: setIsSimulating, 
    theme, 
    isPreviewMode, 
    setIsPreviewMode, 
    currentProject,
    zoom,
    setZoom,
    componentToAdd,
    setComponentToAdd,
    selectedId,
    setSelectedId,
    placedComponents,
    setPlacedComponents,
    wires,
    setWires
}) => {
    const [draggingId, setDraggingId] = useState(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [simResults, setSimResults] = useState({ activeWires: [], activeComponents: [] })
    const [activeWire, setActiveWire] = useState(null)
    const [draggingSegment, setDraggingSegment] = useState(null)
    const canvasRef = useRef(null)

    // Touch specific state
    const [lastTouchPos, setLastTouchPos] = useState({ x: 0, y: 0 })
    const [initialPinchDistance, setInitialPinchDistance] = useState(null)
    const [initialPinchZoom, setInitialPinchZoom] = useState(null)

    // Auto-increment Logic for Tags (Aligned with Computer logic)
    const getNextTagIndex = (compId) => {
        const metadata = componentMap[compId];
        const prefix = metadata.prefix || "";
        
        // Define secondary types (points/contacts) that shouldn't increment primary coils
        const secondaryTypes = ['NCContact', 'NOContact', 'ContactorMainContacts', 'OverloadContact', 'TimerNC', 'TimerNO'];
        const isCurrentSecondary = secondaryTypes.includes(compId);

        // Filter components that share the same prefix AND the same classification (Primary vs Secondary)
        const relevantIndices = placedComponents
            .filter(c => {
                const cPrefix = c.prefix || componentMap[c.componentId].prefix;
                const isCSecondary = secondaryTypes.includes(c.componentId);
                return cPrefix === prefix && isCSecondary === isCurrentSecondary;
            })
            .map(c => c.tagIndex || 0);

        const maxIndex = relevantIndices.length > 0 ? Math.max(...relevantIndices) : 0;
        return maxIndex + 1;
    };

    // Immediate placement from BottomBar
    useEffect(() => {
        if (componentToAdd && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            const x = (rect.width / 2 - pan.x) / zoom
            const y = (rect.height / 2 - pan.y) / zoom
            
            const nextIndex = getNextTagIndex(componentToAdd);

            const newComponent = {
                id: Date.now().toString(),
                componentId: componentToAdd,
                x: Math.round(x / 10) * 10,
                y: Math.round(y / 10) * 10,
                rotation: 0,
                tagIndex: nextIndex,
                label: "",
                labelOffset: { x: -60, y: 0 }
            }
            setPlacedComponents(prev => [...prev, newComponent])
            setComponentToAdd(null)
            setSelectedId(newComponent.id)
        }
    }, [componentToAdd, pan, zoom, setComponentToAdd, setPlacedComponents, setSelectedId, placedComponents])

    // Simulation Effect
    useEffect(() => {
        if (isSimulating) {
            setSelectedId(null);
            const results = runSimulation(placedComponents, wires, componentMap)
            
            if (results.isShortCircuit) {
                setIsSimulating(false)
                alert("⚠️ Short Circuit Detected!")
                return
            }

            const currentStates = placedComponents.map(c => ({
                id: c.id,
                isOn: c.isOn,
                isPressed: c.isPressed,
                motorMode: c.motorState?.mode,
                remainingTime: c.remainingTime
            }));

            const nextStates = results.activeComponents.map(c => ({
                id: c.id,
                isOn: c.isOn,
                isPressed: c.isPressed,
                motorMode: c.motorState?.mode,
                remainingTime: c.remainingTime
            }));

            if (JSON.stringify(currentStates) !== JSON.stringify(nextStates)) {
                setPlacedComponents(results.activeComponents);
            }
            
            setSimResults(results)
        } else {
            setPlacedComponents(prev => prev.map(c => ({ ...c, isOn: false, isPressed: false, remainingTime: c.delay || 1 })));
            setSimResults({ activeWires: [], activeComponents: [] })
        }
    }, [isSimulating, placedComponents, wires, setPlacedComponents, setIsSimulating])

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
                                return { ...comp, remainingTime: newRemaining, isOn: newRemaining <= 0 };
                            }
                        } else {
                            if (comp.remainingTime !== defaultDelay || comp.isOn) {
                                hasChanges = true;
                                return { ...comp, remainingTime: defaultDelay, isOn: false };
                            }
                        }
                    }
                    return comp;
                });
                return hasChanges ? next : prev;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isSimulating, setPlacedComponents]);

    const getPortCanvasPos = (component, port) => {
        const rad = (component.rotation || 0) * (Math.PI / 180)
        const cos = Math.cos(rad)
        const sin = Math.sin(rad)
        const rx = port.x * cos - port.y * sin
        const ry = port.x * sin + port.y * cos
        return { 
            x: Math.round(component.x + rx), 
            y: Math.round(component.y + ry) 
        }
    }

    const startDraggingSegment = (wireId, axis, subKey = '') => {
        if (isSimulating) return
        setDraggingSegment({ wireId, axis, subKey })
    }

    const handleTouchStart = (e) => {
        const rect = canvasRef.current.getBoundingClientRect()
        
        // Handle Multi-touch for Pinch-to-Zoom
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            setInitialPinchDistance(distance);
            setInitialPinchZoom(zoom);
            setIsPanning(false);
            setDraggingId(null);
            return;
        }

        const touch = e.touches[0]
        const x = touch.clientX
        const y = touch.clientY
        const canvasX = (x - rect.left - pan.x) / zoom
        const canvasY = (y - rect.top - pan.y) / zoom

        setLastTouchPos({ x, y })

        // Simulation Mode Interactivity
        if (isSimulating) {
            const hitItem = [...placedComponents].reverse().find(c => {
                const dx = canvasX - c.x;
                const dy = canvasY - c.y;
                return Math.sqrt(dx * dx + dy * dy) < 40; 
            });

            if (hitItem) {
                if (hitItem.componentId === 'PushButtonNC' || hitItem.componentId === 'PushButtonNO') {
                    setPlacedComponents(prev => prev.map(c => c.id === hitItem.id ? { ...c, isPressed: true } : c));
                } else if (hitItem.componentId === 'SinglePoleCB' || hitItem.componentId === 'ThreePoleCB') {
                    setPlacedComponents(prev => prev.map(c => c.id === hitItem.id ? { ...c, isPressed: !c.isPressed } : c));
                }
                return;
            }
            setIsPanning(true);
            return;
        }

        // Port Detection
        for (const comp of placedComponents) {
            const metadata = componentMap[comp.componentId];
            for (const port of metadata.ports) {
                const pos = getPortCanvasPos(comp, port);
                const dx = canvasX - pos.x;
                const dy = canvasY - pos.y;
                if (Math.sqrt(dx * dx + dy * dy) < 20) {
                    handlePortClick(comp.id, port);
                    return;
                }
            }
        }

        // Component Detection
        const hitComponent = [...placedComponents].reverse().find(c => {
            const dx = canvasX - c.x
            const dy = canvasY - c.y
            return Math.sqrt(dx * dx + dy * dy) < 35
        })

        if (hitComponent) {
            setSelectedId(hitComponent.id)
            setDraggingId(hitComponent.id)
            setDragOffset({ x: canvasX - hitComponent.x, y: canvasY - hitComponent.y })
            return;
        }

        // Wire Detection
        const hitWire = wires.find(wire => {
            const fromComp = placedComponents.find(c => c.id === wire.from.compId)
            const toComp = placedComponents.find(c => c.id === wire.to.compId)
            if (!fromComp || !toComp) return false
            const fromPort = componentMap[fromComp.componentId].ports.find(p => p.id === wire.from.portId)
            const toPort = componentMap[toComp.componentId].ports.find(p => p.id === wire.to.portId)
            const start = getPortCanvasPos(fromComp, fromPort)
            const end = getPortCanvasPos(toComp, toPort)
            const midY1 = wire.midY1 ?? start.y, midX1 = wire.midX1 ?? start.x, midY = wire.midY ?? (start.y + end.y) / 2, midX2 = wire.midX2 ?? end.x, midY2 = wire.midY2 ?? end.y
            
            const segments = [
                {p1: start, p2: {x: start.x, y: midY1}},
                {p1: {x: start.x, y: midY1}, p2: {x: midX1, y: midY1}},
                {p1: {x: midX1, y: midY1}, p2: {x: midX1, y: midY}},
                {p1: {x: midX1, y: midY}, p2: {x: midX2, y: midY}},
                {p1: {x: midX2, y: midY}, p2: {x: midX2, y: midY2}},
                {p1: {x: midX2, y: midY2}, p2: {x: end.x, y: midY2}},
                {p1: {x: end.x, y: midY2}, p2: end}
            ];

            return segments.some(seg => {
                const minX = Math.min(seg.p1.x, seg.p2.x) - 15;
                const maxX = Math.max(seg.p1.x, seg.p2.x) + 15;
                const minY = Math.min(seg.p1.y, seg.p2.y) - 15;
                const maxY = Math.max(seg.p1.y, seg.p2.y) + 15;
                return canvasX >= minX && canvasX <= maxX && canvasY >= minY && canvasY <= maxY;
            });
        });

        if (hitWire) {
            setSelectedId(hitWire.id);
            return;
        }

        setIsPanning(true)
        setSelectedId(null)
        setActiveWire(null) // Deselect point/cancel wire drawing
    }

    const handleTouchMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect()

        // Handle Pinch-to-Zoom Move
        if (e.touches.length === 2 && initialPinchDistance !== null) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            const scale = distance / initialPinchDistance;
            const newZoom = Math.min(3, Math.max(0.1, initialPinchZoom * scale));
            setZoom(newZoom);
            return;
        }

        const touch = e.touches[0]
        const canvasX = (touch.clientX - rect.left - pan.x) / zoom
        const canvasY = (touch.clientY - rect.top - pan.y) / zoom

        if (draggingId) {
            const item = placedComponents.find(c => c.id === draggingId)
            const newX = Math.round((canvasX - dragOffset.x) / 10) * 10
            const newY = Math.round((canvasY - dragOffset.y) / 10) * 10
            
            if (newX !== item.x || newY !== item.y) {
                setPlacedComponents(prev => prev.map(c => c.id === draggingId ? { ...c, x: newX, y: newY } : c))
                
                const dx = newX - item.x;
                const dy = newY - item.y;
                setWires(prev => prev.map(w => {
                    if (w.from.compId === draggingId || w.to.compId === draggingId) {
                        const nextWire = { ...w };
                        if (w.midY !== undefined) nextWire.midY = w.midY + dy;
                        if (w.from.compId === draggingId) {
                            if (w.midX1 !== undefined) nextWire.midX1 = w.midX1 + dx;
                            if (w.midY1 !== undefined) nextWire.midY1 = w.midY1 + dy;
                        }
                        if (w.to.compId === draggingId) {
                            if (w.midX2 !== undefined) nextWire.midX2 = w.midX2 + dx;
                            if (w.midY2 !== undefined) nextWire.midY2 = w.midY2 + dy;
                        }
                        return nextWire;
                    }
                    return w;
                }));
            }
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
        } else if (isPanning) {
            setPan({
                x: pan.x + (touch.clientX - lastTouchPos.x),
                y: pan.y + (touch.clientY - lastTouchPos.y)
            })
            setLastTouchPos({ x: touch.clientX, y: touch.clientY })
        } else if (activeWire) {
             setActiveWire({ ...activeWire, to: { x: canvasX, y: canvasY } })
        }
    }

    const handleTouchEnd = () => {
        if (isSimulating) {
            setPlacedComponents(prev => prev.map(c => 
                (c.componentId === 'PushButtonNC' || c.componentId === 'PushButtonNO') ? { ...c, isPressed: false } : c
            ));
        }
        setDraggingId(null)
        setIsPanning(false)
        setDraggingSegment(null)
        setInitialPinchDistance(null)
    }

    const handlePortClick = (compId, port) => {
        if (isSimulating) return
        const component = placedComponents.find(c => c.id === compId)
        const pos = getPortCanvasPos(component, port)

        if (activeWire) {
            if (activeWire.from.compId === compId && activeWire.from.portId === port.id) {
                setActiveWire(null)
                return
            }
            const startX = activeWire.from.x;
            const startY = activeWire.from.y;
            const endX = pos.x;
            const endY = pos.y;
            const isHorizontal = Math.abs(startY - endY) < 5;
            const isVertical = Math.abs(startX - endX) < 5;

            const newWire = {
                id: Date.now().toString(),
                from: activeWire.from,
                to: { compId, portId: port.id },
                midY1: isHorizontal ? startY : startY,
                midX1: isVertical ? startX : startX,
                midY: isHorizontal ? startY : (startY + endY) / 2,
                midX2: isVertical ? startX : endX,
                midY2: isHorizontal ? startY : endY
            }
            setWires([...wires, newWire])
            setActiveWire(null)
        } else {
            setActiveWire({
                from: { compId, portId: port.id, ...pos },
                to: { x: pos.x, y: pos.y }
            })
        }
    }

    return (
        <div
            ref={canvasRef}
            className="grow relative overflow-hidden bg-(--bg-primary) select-none outline-none canvas-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                id="panning-surface"
                className="absolute inset-0"
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
                {/* Wires */}
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
                        let strokeColor = isWireSelected ? "#0ea5e9" : (theme === 'dark' ? '#ffffff' : '#000000')
                        if (isSimulating && simWire) {
                            strokeColor = simWire.state === 'line' ? "#ef4444" : (simWire.state === 'neutral' ? "#2563eb" : strokeColor)
                        }
                        
                        const midY1 = wire.midY1 ?? start.y, midX1 = wire.midX1 ?? start.x, midY = wire.midY ?? (start.y + end.y) / 2, midX2 = wire.midX2 ?? end.x, midY2 = wire.midY2 ?? end.y
                        const points = `${start.x},${start.y} ${start.x},${midY1} ${midX1},${midY1} ${midX1},${midY} ${midX2},${midY} ${midX2},${midY2} ${end.x},${midY2} ${end.x},${end.y}`
                        
                        return (
                            <g key={wire.id} className="pointer-events-auto cursor-pointer">
                                <polyline points={points} fill="none" stroke="transparent" strokeWidth="15" />
                                <polyline
                                    points={points} fill="none" stroke={strokeColor} strokeWidth="1"
                                    strokeLinecap="butt" strokeLinejoin="miter"
                                    style={{ shapeRendering: 'crispEdges' }}
                                />
                                {isWireSelected && !isSimulating && (
                                    <g>
                                        <line onTouchStart={(e) => { e.stopPropagation(); startDraggingSegment(wire.id, 'y', 'midY1'); }} x1={start.x} y1={midY1} x2={midX1} y2={midY1} stroke="#0ea5e9" strokeWidth="12" strokeOpacity="0.2" />
                                        <line onTouchStart={(e) => { e.stopPropagation(); startDraggingSegment(wire.id, 'x', 'midX1'); }} x1={midX1} y1={midY1} x2={midX1} y2={midY} stroke="#0ea5e9" strokeWidth="12" strokeOpacity="0.2" />
                                        <line onTouchStart={(e) => { e.stopPropagation(); startDraggingSegment(wire.id, 'y'); }} x1={midX1} y1={midY} x2={midX2} y2={midY} stroke="#0ea5e9" strokeWidth="12" strokeOpacity="0.2" />
                                        <line onTouchStart={(e) => { e.stopPropagation(); startDraggingSegment(wire.id, 'x', 'midX2'); }} x1={midX2} y1={midY} x2={midX2} y2={midY2} stroke="#0ea5e9" strokeWidth="12" strokeOpacity="0.2" />
                                        <line onTouchStart={(e) => { e.stopPropagation(); startDraggingSegment(wire.id, 'y', 'midY2'); }} x1={midX2} y1={midY2} x2={end.x} y2={midY2} stroke="#0ea5e9" strokeWidth="12" strokeOpacity="0.2" />
                                    </g>
                                )}
                            </g>
                        )
                    })}
                    {activeWire && (
                        <polyline
                            points={`${activeWire.from.x},${activeWire.from.y} ${activeWire.from.x},${activeWire.to.y} ${activeWire.to.x},${activeWire.to.y}`}
                            fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4"
                            strokeLinecap="butt" strokeLinejoin="miter" style={{ shapeRendering: 'crispEdges' }}
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
                                    strokeDasharray="5,3"
                                    opacity="0.5"
                                />
                                <line
                                    x1="-10000" y1={selectedComp.y}
                                    x2="10000" y2={selectedComp.y}
                                    stroke="#3b82f6"
                                    strokeWidth="1"
                                    strokeDasharray="5,3"
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

                {/* Components */}
                {placedComponents.map((item) => {
                    const simComp = simResults.activeComponents.find(c => c.id === item.id)
                    const { Component, ports } = componentMap[item.componentId]
                    const isSelected = selectedId === item.id
                    const isPowered = isSimulating && simComp?.isOn
                    const portPotentials = simComp?.portPotentials || {}

                    let compColor = theme === 'dark' ? '#ffffff' : '#000000'
                    if (isSelected) compColor = "#0ea5e9"
                    else if (isSimulating) {
                        const isContactOrButton = ['NCContact', 'NOContact', 'PushButtonNC', 'PushButtonNO'].includes(item.componentId);
                        if (item.componentId === 'PowerLine' || item.componentId === 'ThreePhaseLine') compColor = "#ef4444"
                        else if (item.componentId === 'Nutral') compColor = "#2563eb"
                        else if (isPowered && !isContactOrButton && item.componentId !== 'Lamp') compColor = "#fbbf24"
                    }

                    return (
                        <div
                            key={item.id}
                            className="absolute"
                            style={{ left: item.x, top: item.y, transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`, zIndex: isSelected ? 10 : 1 }}
                        >
                            <Component
                                color={compColor} isOn={isPowered} isSimulating={isSimulating} isSelected={isSelected}
                                portPotentials={portPotentials}
                                motorState={simComp?.motorState} 
                                timerState={simComp?.timerState || {
                                    delay: item.delay || 1,
                                    remainingTime: item.remainingTime ?? (item.delay || 1),
                                    isEnergized: false
                                }}
                                prefix={item.prefix || componentMap[item.componentId].prefix} bulbColor={item.bulbColor || 'red'}
                            />
                            
                            {!isSimulating && ports.map(port => {
                                const isActive = activeWire?.from.compId === item.id && activeWire?.from.portId === port.id;
                                return (
                                    <div
                                        key={port.id}
                                        className={`absolute w-3 h-3 border-2 rounded-full z-20 transition-colors ${isActive ? 'bg-blue-600 border-blue-600' : 'bg-[var(--card-bg)] border-(--text-primary)'}`}
                                        style={{ left: `calc(50% + ${port.x}px)`, top: `calc(50% + ${port.y}px)`, transform: 'translate(-50%, -50%)' }}
                                    />
                                );
                            })}

                            {componentMap[item.componentId].showProperties && (
                                <div
                                    className="absolute whitespace-nowrap flex flex-col items-center gap-1.5 pointer-events-none"
                                    style={{
                                        left: `calc(50% + ${componentMap[item.componentId].labelOffset?.x || -60}px)`,
                                        top: `calc(50% + ${componentMap[item.componentId].labelOffset?.y || 0}px)`,
                                        transform: 'translate(-50%, -50%) rotate(-90deg)',
                                        zIndex: 30
                                    }}
                                >
                                    <div className="flex flex-col items-center gap-1.5">
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
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Canva