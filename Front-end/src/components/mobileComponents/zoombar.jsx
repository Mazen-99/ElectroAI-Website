import React from 'react'
import { FaSearchPlus, FaSearchMinus, FaExpand } from 'react-icons/fa'

const ZoomBar = ({ zoom, setZoom }) => {
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3))
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.2))
    const handleReset = () => setZoom(1)

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] px-4 py-2 rounded-2xl flex items-center gap-4 shadow-xl z-[60]">
            <button 
                onClick={handleZoomOut}
                className="p-2 text-[var(--text-secondary)] hover:text-blue-500 transition-colors active:scale-90"
            >
                <FaSearchMinus />
            </button>
            
            <div className="w-px h-4 bg-[var(--border-color)]" />
            
            <span className="text-[10px] font-black text-[var(--text-primary)] w-10 text-center">
                {Math.round(zoom * 100)}%
            </span>
            
            <div className="w-px h-4 bg-[var(--border-color)]" />
            
            <button 
                onClick={handleZoomIn}
                className="p-2 text-[var(--text-secondary)] hover:text-blue-500 transition-colors active:scale-90"
            >
                <FaSearchPlus />
            </button>
            
            <div className="w-px h-4 bg-[var(--border-color)]" />
            
            <button 
                onClick={handleReset}
                className="p-2 text-[var(--text-secondary)] hover:text-blue-500 transition-colors active:scale-90"
            >
                <FaExpand />
            </button>
        </div>
    )
}

export default ZoomBar
