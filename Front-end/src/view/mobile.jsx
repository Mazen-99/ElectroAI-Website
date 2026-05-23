import React, { useState, useEffect } from 'react'
import TopBar from '../components/mobileComponents/topbar'
import BottomBar from '../components/mobileComponents/bottombar'
import Canva from '../components/mobileComponents/canva'
import AIChat from '../components/mobileComponents/aiChat'
import ZoomBar from '../components/mobileComponents/zoombar'
import PropertiesBar from '../components/mobileComponents/propertiesBar'

const Mobile = () => {
    const [isSimulating, setIsSimulating] = useState(false)
    const [theme, setTheme] = useState(() => localStorage.getItem('electro_theme') || 'light')
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [currentProject, setCurrentProject] = useState(() => localStorage.getItem('electro_active_project') || 'Default Project')
    const [zoom, setZoom] = useState(1)
    const [componentToAdd, setComponentToAdd] = useState(null)
    const [selectedId, setSelectedId] = useState(null)
    const [placedComponents, setPlacedComponents] = useState([])
    const [wires, setWires] = useState([])
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('electro_theme', theme)
    }, [theme])

    useEffect(() => {
        localStorage.setItem('electro_active_project', currentProject)
    }, [currentProject])

    // Load circuit from localStorage
    useEffect(() => {
        const savedComponents = localStorage.getItem(`electro_comp_${currentProject}`)
        const savedWires = localStorage.getItem(`electro_wire_${currentProject}`)
        if (savedComponents) {
            try { setPlacedComponents(JSON.parse(savedComponents)) } catch (e) { setPlacedComponents([]) }
        } else { setPlacedComponents([]) }
        if (savedWires) {
            try { setWires(JSON.parse(savedWires)) } catch (e) { setWires([]) }
        } else { setWires([]) }
        setIsInitialized(true)
    }, [currentProject])

    // Save to localStorage
    useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem(`electro_comp_${currentProject}`, JSON.stringify(placedComponents))
        localStorage.setItem(`electro_wire_${currentProject}`, JSON.stringify(wires))
    }, [placedComponents, wires, currentProject, isInitialized])

    const handleDelete = (id) => {
        setPlacedComponents(prev => prev.filter(c => c.id !== id));
        setWires(prev => prev.filter(w => w.from.compId !== id && w.to.compId !== id && w.id !== id));
        setSelectedId(null);
    };

    const handleRotate = (id, deg) => {
        setPlacedComponents(prev => prev.map(c => 
            c.id === id ? { ...c, rotation: (c.rotation + deg) % 360 } : c
        ));
    };
    
    const handleClearAll = () => {
        setPlacedComponents([]);
        setWires([]);
        setSelectedId(null);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    window.dispatchEvent(new CustomEvent('electro_import_circuit', { detail: data }));
                } catch (err) {
                    alert("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleExport = () => {
        const data = {
            components: placedComponents,
            wires: wires
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentProject}_circuit.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle instant import from AI Chat or other sources
    useEffect(() => {
        const handleAIImport = (e) => {
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
            setSelectedId(null);
        };

        window.addEventListener('electro_import_circuit', handleAIImport);
        return () => window.removeEventListener('electro_import_circuit', handleAIImport);
    }, [setPlacedComponents, setWires, setSelectedId]);

    return (
        <div className="flex flex-col h-dvh overflow-hidden bg-(--bg-primary) transition-colors duration-300">
            {!isPreviewMode && (
                <TopBar 
                    isSimulating={isSimulating} 
                    setIsSimulating={setIsSimulating} 
                    theme={theme} 
                    setTheme={setTheme} 
                    isPreviewMode={isPreviewMode}
                    setIsPreviewMode={setIsPreviewMode}
                    currentProject={currentProject}
                    setCurrentProject={setCurrentProject}
                    onClearAll={handleClearAll}
                    onImport={handleImport}
                    onExport={handleExport}
                />
            )}

            {!isPreviewMode && selectedId && (
                <PropertiesBar 
                    selectedId={selectedId}
                    placedComponents={placedComponents}
                    setPlacedComponents={setPlacedComponents}
                    wires={wires}
                    setWires={setWires}
                    onDelete={handleDelete}
                    onRotate={handleRotate}
                />
            )}
            
            <div className="flex grow relative overflow-hidden">
                <Canva 
                    isSimulatingProp={isSimulating} 
                    setIsSimulatingProp={setIsSimulating} 
                    theme={theme}
                    isPreviewMode={isPreviewMode}
                    setIsPreviewMode={setIsPreviewMode}
                    currentProject={currentProject}
                    zoom={zoom}
                    setZoom={setZoom}
                    componentToAdd={componentToAdd}
                    setComponentToAdd={setComponentToAdd}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    placedComponents={placedComponents}
                    setPlacedComponents={setPlacedComponents}
                    wires={wires}
                    setWires={setWires}
                />

                {!isPreviewMode && <AIChat key={currentProject} currentProject={currentProject} />}
                
                {!isPreviewMode && (
                    <ZoomBar zoom={zoom} setZoom={setZoom} />
                )}
            </div>

            {!isPreviewMode && (
                <BottomBar 
                    theme={theme} 
                    isSimulating={isSimulating}
                    onSelectComponent={(id) => setComponentToAdd(id)}
                />
            )}

            {/* Exit Preview Mode Button */}
            {isPreviewMode && (
                <button 
                    onClick={() => setIsPreviewMode(false)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl z-300 active:scale-90"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                </button>
            )}
        </div>
    )
}

export default Mobile