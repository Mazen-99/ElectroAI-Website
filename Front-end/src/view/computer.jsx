import React, { useState, useEffect } from 'react'
import Header from '../components/computerComponents/header'
import BottomBar from '../components/computerComponents/bottomBar'
import Canva from '../components/computerComponents/canva'
import AIChat from '../components/computerComponents/aiChat'

const Computer = () => {
    const [isSimulating, setIsSimulating] = useState(false)
    const [theme, setTheme] = useState(() => localStorage.getItem('electro_theme') || 'light')
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [currentProject, setCurrentProject] = useState(() => localStorage.getItem('electro_active_project') || 'Default Project')
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('electro_theme', theme)
    }, [theme])

    useEffect(() => {
        localStorage.setItem('electro_active_project', currentProject)
    }, [currentProject])

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-(--bg-primary) transition-colors duration-300">
            {!isPreviewMode && (
                <Header 
                    isSimulating={isSimulating} 
                    setIsSimulating={setIsSimulating} 
                    theme={theme} 
                    setTheme={setTheme} 
                    isPreviewMode={isPreviewMode}
                    setIsPreviewMode={setIsPreviewMode}
                    currentProject={currentProject}
                    setCurrentProject={setCurrentProject}
                    onRefresh={() => setRefreshKey(prev => prev + 1)}
                />
            )}
            
            <div className="flex grow relative overflow-hidden">
                <div className="grow relative bg-(--bg-secondary) overflow-hidden">
                    <Canva 
                        key={currentProject}
                        isSimulatingProp={isSimulating} 
                        setIsSimulatingProp={setIsSimulating} 
                        theme={theme}
                        isPreviewMode={isPreviewMode}
                        setIsPreviewMode={setIsPreviewMode}
                        currentProject={currentProject}
                    />
                </div>

                {!isPreviewMode && <AIChat key={currentProject} currentProject={currentProject} />}
            </div>

            {!isPreviewMode && <BottomBar theme={theme} isSimulating={isSimulating} />}
        </div>
    )
}

export default Computer