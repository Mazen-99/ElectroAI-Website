import React from 'react'
import { componentMap } from '../electrical/components'

const BottomBar = ({ theme, onSelectComponent, isSimulating }) => {
  const compColor = theme === 'dark' ? '#ffffff' : '#000000'

  const order = [
    'ThreePhaseLine',
    'PowerLine',
    'Nutral',
    'Relay',
    'Contactor',
    'OnDelayTimer',
    'NCContact',
    'NOContact',
    'ContactorMainContacts',
    'PushButtonNC',
    'PushButtonNO',
    'SinglePoleCB',
    'ThreePoleCB',
    'Lamp',
    'SimpleMotor',
    'AdvancedMotor'
  ]

  return (
    <div className={`h-20 bg-[var(--header-bg)] border-t border-[var(--border-color)] flex items-center px-4 gap-4 overflow-x-auto no-scrollbar z-50 transition-all duration-500 ${isSimulating ? 'brightness-50 grayscale pointer-events-none opacity-80' : ''}`}>
      {order.map((id) => {
        const componentData = componentMap[id];
        if (!componentData) return null;
        const { Component, displayName } = componentData;

        return (
          <div
            key={id}
            className="flex flex-col items-center justify-center shrink-0 active:scale-95 transition-all duration-300"
            onClick={() => !isSimulating && onSelectComponent && onSelectComponent(id)}
            draggable={!isSimulating}
            onDragStart={(e) => {
              if (isSimulating) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.setData("componentId", id);
            }}
          >
            <div className="w-12 h-12 flex items-center justify-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-sm overflow-hidden">
              <div className="scale-[0.3] pointer-events-none transform origin-center">
                <Component color={compColor} />
              </div>
            </div>
            <span className="text-[8px] font-black uppercase text-[var(--text-secondary)] mt-1 tracking-tighter truncate w-14 text-center">
                {displayName}
            </span>
          </div>
        );
      })}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}

export default BottomBar
