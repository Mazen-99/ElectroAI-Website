import React from 'react'
import { componentMap } from '../electrical/components'

const BottomBar = ({ theme, isSimulating }) => {
  const compColor = theme === 'dark' ? '#ffffff' : '#000000'

  // Custom order as requested by the user
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
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-(--header-bg) backdrop-blur-lg border-t border-(--border-color) flex items-center px-6 pt-4 gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      {order.map((id) => {
        const componentData = componentMap[id];
        if (!componentData) return null;
        const { Component, displayName } = componentData;

        return (
          <div
            key={id}
            className={`group relative flex flex-col items-center justify-center shrink-0 transition-all duration-300 mb-2 ${!isSimulating ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-50'}`}
            draggable={!isSimulating}
            onDragStart={(e) => {
              if (isSimulating) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.setData("componentId", id);
            }}
          >
            {/* Component Preview */}
            <div className="w-14 h-14 flex items-center justify-center bg-(--card-bg) border border-(--border-color) rounded-2xl group-hover:border-blue-400 group-hover:scale-110 transition-all duration-300 shadow-sm overflow-hidden">
              <div className="scale-[0.35] pointer-events-none transform origin-center">
                <Component color={compColor} />
              </div>
            </div>

            {/* Label below */}
            <span className="text-[9px] font-black uppercase text-(--text-secondary) mt-1.5 tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {displayName}
            </span>
            
            {/* Tooltip style enhancement */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg -translate-y-2 group-hover:translate-y-0">
               {displayName}
               <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          </div>
        );
      })}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
            height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #3b82f6;
            background-clip: padding-box;
        }
      `}} />
    </div>
  )
}

export default BottomBar
