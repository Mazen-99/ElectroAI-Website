import React from 'react'
import { FaTrash, FaSync, FaPlus, FaMinus } from 'react-icons/fa'
import { componentMap } from '../electrical/components'

const PropertiesBar = ({ 
    selectedId, 
    placedComponents, 
    setPlacedComponents, 
    wires, 
    setWires, 
    onDelete,
    onRotate
}) => {
    const targetComp = placedComponents.find(c => c.id === selectedId);
    const targetWire = wires.find(w => w.id === selectedId);

    if (!targetComp && !targetWire) return null;

    // Handle Wire selection
    if (targetWire) {
        return (
            <div className="fixed top-20 left-0 right-0 h-20 bg-[var(--card-bg)] border-b border-[var(--border-color)] flex items-center px-6 gap-4 z-40 overflow-x-auto no-scrollbar shadow-lg animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 bg-red-500/10 text-red-500 px-5 py-3 rounded-2xl border border-red-500/20 active:scale-95 transition-all shadow-sm shrink-0" onClick={() => onDelete(selectedId)}>
                    <FaTrash className="text-lg" />
                    <span className="text-sm font-black uppercase tracking-tight">Delete Wire</span>
                </div>
            </div>
        )
    }

    const metadata = componentMap[targetComp.componentId];
    if (!metadata) return null;

    const isPowerComp = ['PowerLine', 'Nutral', 'ThreePhaseLine'].includes(targetComp.componentId);

    const updateComp = (updates) => {
        setPlacedComponents(prev => prev.map(c => c.id === targetComp.id ? { ...c, ...updates } : c));
    };

    return (
        <div className="fixed top-15 left-0 right-0 h-15 bg-[var(--bg-secondary)] border-b border-blue-500/30 flex items-center px-6 gap-8 z-40 overflow-x-auto overflow-y-hidden no-scrollbar shadow-[0_4px_20px_rgba(0,0,0,0.15)] animate-in slide-in-from-top-4 duration-300 py-10 ">
            {/* Header / Identifier */}
            <div className="flex flex-col shrink-0">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Editing</span>
                <span className="text-xs font-black text-[var(--text-primary)] truncate max-w-[100px]">{metadata.displayName}</span>
            </div>

            <div className="w-px h-10 bg-[var(--border-color)] shrink-0" />

            {/* Basic Actions: Rotate & Delete - ALWAYS VISIBLE FOR ALL COMPONENTS */}
            <div className="flex items-center gap-2 shrink-0">
                <button 
                    onClick={() => onRotate(targetComp.id, 90)}
                    className="w-11 h-11 flex items-center justify-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] active:scale-90 transition-all shadow-sm hover:border-blue-500"
                >
                    <FaSync className="text-sm" />
                </button>
                <button 
                    onClick={() => onDelete(targetComp.id)}
                    className="w-11 h-11 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl active:scale-90 transition-all shadow-sm"
                >
                    <FaTrash className="text-sm" />
                </button>
            </div>

            {/* Conditional Properties: Only if NOT a power component and metadata allows */}
            {!isPowerComp && metadata.showProperties && (
                <>
                    <div className="w-px h-10 bg-[var(--border-color)] shrink-0" />

                    {/* Lamp Specific: Color Picker */}
                    {targetComp.componentId === 'Lamp' && (
                        <div className="flex flex-col gap-1.5 shrink-0">
                            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-tighter">Lamp Color</label>
                            <div className="flex gap-2.5 p-1.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl h-10 items-center px-2.5 shadow-inner">
                                {['red', 'green', 'blue', 'yellow'].map(color => (
                                    <button
                                        key={color}
                                        className={`w-6 h-6 rounded-full border-2 transition-all ${targetComp.bulbColor === color || (!targetComp.bulbColor && color === 'red') ? 'border-blue-500 scale-125 shadow-md' : 'border-transparent'}`}
                                        style={{ backgroundColor: color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : color === 'blue' ? '#3b82f6' : '#fbbf24' }}
                                        onClick={() => updateComp({ bulbColor: color })}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Non-Lamp Properties: Tag & Index */}
                    {targetComp.componentId !== 'Lamp' && (
                        <>
                            {/* Prefix Toggle (R/K/T) */}
                            {(targetComp.componentId === 'NCContact' || targetComp.componentId === 'NOContact' || targetComp.componentId === 'Relay' || targetComp.componentId === 'Contactor') && (
                                <div className="flex flex-col gap-1.5 shrink-0">
                                    <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-tighter">Tag</label>
                                    <button
                                        className="h-10 w-10 flex items-center justify-center bg-blue-500 text-white rounded-xl text-xs font-black active:scale-95 transition-all shadow-md shadow-blue-500/20"
                                        onClick={() => {
                                            const current = targetComp.prefix || metadata.prefix || 'R';
                                            const next = current === 'R' ? 'K' : current === 'K' ? 'T' : 'R';
                                            updateComp({ prefix: next });
                                        }}
                                    >
                                        {targetComp.prefix || metadata.prefix || 'R'}
                                    </button>
                                </div>
                            )}

                            {/* Index +/- */}
                            <div className="flex flex-col gap-1.5 shrink-0">
                                <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-tighter">Index</label>
                                <div className="flex items-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden h-10 shadow-sm">
                                    <button 
                                        className="px-4 h-full hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]" 
                                        onClick={() => {
                                            const newIndex = Math.max(1, (targetComp.tagIndex || 1) - 1);
                                            const prefix = targetComp.prefix || metadata.prefix || 'R';
                                            const isSecondary = ['NCContact', 'NOContact', 'ContactorMainContacts'].includes(targetComp.componentId);
                                            const isTaken = !isSecondary && placedComponents.some(c => 
                                                c.id !== targetComp.id && 
                                                !['NCContact', 'NOContact', 'ContactorMainContacts'].includes(c.componentId) &&
                                                (c.prefix || componentMap[c.componentId].prefix) === prefix && 
                                                (c.tagIndex || 1) === newIndex
                                            );
                                            if (!isTaken) updateComp({ tagIndex: newIndex });
                                        }}
                                    >
                                        <FaMinus size={10} />
                                    </button>
                                    <div className="px-4 font-black text-sm min-w-[40px] text-center border-x border-[var(--border-color)]">{targetComp.tagIndex || 1}</div>
                                    <button 
                                        className="px-4 h-full hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]" 
                                        onClick={() => {
                                            const newIndex = (targetComp.tagIndex || 1) + 1;
                                            const prefix = targetComp.prefix || metadata.prefix || 'R';
                                            const isSecondary = ['NCContact', 'NOContact', 'ContactorMainContacts'].includes(targetComp.componentId);
                                            const isTaken = !isSecondary && placedComponents.some(c => 
                                                c.id !== targetComp.id && 
                                                !['NCContact', 'NOContact', 'ContactorMainContacts'].includes(c.componentId) &&
                                                (c.prefix || componentMap[c.componentId].prefix) === prefix && 
                                                (c.tagIndex || 1) === newIndex
                                            );
                                            if (!isTaken) updateComp({ tagIndex: newIndex });
                                        }}
                                    >
                                        <FaPlus size={10} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Timer Delay Specific */}
                    {targetComp.componentId === 'OnDelayTimer' && (
                        <div className="flex flex-col gap-1.5 shrink-0">
                            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-tighter">Delay (s)</label>
                            <div className="flex items-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden h-10 shadow-sm">
                                <button className="px-4 h-full hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]" onClick={() => updateComp({ delay: Math.max(1, (targetComp.delay || 1) - 1), remainingTime: Math.max(1, (targetComp.delay || 1) - 1) })}><FaMinus size={10} /></button>
                                <div className="px-4 font-black text-sm min-w-[40px] text-center border-x border-[var(--border-color)]">{targetComp.delay || 1}</div>
                                <button className="px-4 h-full hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]" onClick={() => updateComp({ delay: (targetComp.delay || 1) + 1, remainingTime: (targetComp.delay || 1) + 1 })}><FaPlus size={10} /></button>
                            </div>
                        </div>
                    )}

                    {/* Label Input */}
                    <div className="flex flex-col gap-1.5 shrink-0 min-w-[180px]">
                        <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-tighter">{targetComp.componentId === 'Lamp' ? 'Lamp Name' : 'Label'}</label>
                        <input 
                            type="text" 
                            value={targetComp.label || ""}
                            onChange={(e) => updateComp({ label: e.target.value })}
                            placeholder={targetComp.componentId === 'Lamp' ? 'Run Lamp, Stop Lamp...' : "Enter Label"}
                            className="h-10 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl px-4 text-xs text-[var(--text-primary)] outline-none focus:border-blue-500 transition-all shadow-inner font-bold"
                        />
                    </div>
                </>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    )
}

export default PropertiesBar
