import React from 'react'
import { componentMap } from '../electrical/components'

const Topbar = () => {
  return (
    <div className="flex items-center w-full bg-[#fcfcfc] border-b border-gray-200 px-4 py-3 gap-4 overflow-x-auto overflow-y-hidden shadow-lg">
      {Object.entries(componentMap).map(([id, { Component, displayName }]) => (
        <div
          key={id}
          className="group relative flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shrink-0 transition-all duration-300"
          draggable="true"
          onDragStart={(e) => {
            e.dataTransfer.setData("componentId", id);
          }}
        >
          {/* Component Preview */}
          <div className="w-18 h-18 flex items-center justify-center bg-white border border-gray-100 rounded-xl group-hover:border-blue-400 group-hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="scale-[0.45] pointer-events-none transform origin-center">
              <Component />
            </div>
          </div>

          {/* Hover Label (Tooltip style) */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg translate-y-2 group-hover:translate-y-0">
             {displayName}
             {/* Small triangle for tooltip */}
             <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      ))}
      
      {/* Hide scrollbar utility styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}

export default Topbar