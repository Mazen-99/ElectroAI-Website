import React, { useState, useEffect } from 'react'
import { FaPlay, FaStop, FaSave, FaSun, FaMoon, FaEye, FaFolderOpen, FaPlus, FaTrash, FaCheck, FaDownload, FaUpload, FaExpand, FaCompress } from 'react-icons/fa'
import { toPng } from 'html-to-image'
import Canva from './canva'

const Header = ({
    isSimulating,
    setIsSimulating,
    theme,
    setTheme,
    isPreviewMode,
    setIsPreviewMode,
    currentProject,
    setCurrentProject,
    onRefresh
}) => {
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [editingProject, setEditingProject] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const handleExportCircuit = () => {
        const components = localStorage.getItem(`electro_comp_${currentProject}`);
        const wires = localStorage.getItem(`electro_wire_${currentProject}`);

        const data = {
            projectName: currentProject,
            version: "1.0",
            circuit: {
                components: components ? JSON.parse(components) : [],
                wires: wires ? JSON.parse(wires) : []
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentProject}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportCircuit = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.circuit || !data.circuit.components) {
                    alert("Invalid circuit file format! Make sure it's a valid ElectroAI JSON.");
                    return;
                }

                // Update localStorage
                localStorage.setItem(`electro_comp_${currentProject}`, JSON.stringify(data.circuit.components));
                localStorage.setItem(`electro_wire_${currentProject}`, JSON.stringify(data.circuit.wires || []));

                // Dispatch custom event for instant update without race conditions
                window.dispatchEvent(new CustomEvent('electro_import_circuit', {
                    detail: {
                        components: data.circuit.components,
                        wires: data.circuit.wires || []
                    }
                }));

                // Force UI update for other parts of the app
                if (onRefresh) {
                    onRefresh();
                }

                // Reset file input
                event.target.value = '';

                console.log("Circuit imported successfully to localStorage for project:", currentProject);
            } catch (err) {
                console.error("Import Error:", err);
                alert("Failed to parse circuit file. Please check if the file is a valid JSON.");
            }
        };
        reader.readAsText(file);
    };

    // Load project list
    useEffect(() => {
        const savedProjects = localStorage.getItem('electro_projects_list');
        if (savedProjects) {
            setProjects(JSON.parse(savedProjects));
        } else {
            const initialList = ['Default Project'];
            setProjects(initialList);
            localStorage.setItem('electro_projects_list', JSON.stringify(initialList));
        }
    }, []);

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

    const addNewProject = () => {
        if (!newProjectName.trim()) return;
        if (projects.includes(newProjectName.trim())) {
            alert("Project name already exists!");
            return;
        }
        const newList = [...projects, newProjectName.trim()];
        setProjects(newList);
        localStorage.setItem('electro_projects_list', JSON.stringify(newList));
        setCurrentProject(newProjectName.trim());
        setNewProjectName('');
        setIsProjectMenuOpen(false);
    };

    const renameProject = (oldName) => {
        const finalName = editValue.trim();
        if (!finalName || finalName === oldName) {
            setEditingProject(null);
            return;
        }
        if (projects.includes(finalName)) {
            alert("Project name already exists!");
            return;
        }

        const newList = projects.map(p => p === oldName ? finalName : p);
        setProjects(newList);
        localStorage.setItem('electro_projects_list', JSON.stringify(newList));

        // Migrate data
        const compData = localStorage.getItem(`electro_comp_${oldName}`);
        const wireData = localStorage.getItem(`electro_wire_${oldName}`);
        const chatData = localStorage.getItem(`electro_chat_${oldName}`);

        if (compData) localStorage.setItem(`electro_comp_${finalName}`, compData);
        if (wireData) localStorage.setItem(`electro_wire_${finalName}`, wireData);
        if (chatData) localStorage.setItem(`electro_chat_${finalName}`, chatData);

        localStorage.removeItem(`electro_comp_${oldName}`);
        localStorage.removeItem(`electro_wire_${oldName}`);
        localStorage.removeItem(`electro_chat_${oldName}`);

        if (currentProject === oldName) {
            setCurrentProject(finalName);
        }
        setEditingProject(null);
    };

    const deleteProject = (e, name) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        const newList = projects.filter(p => p !== name);
        setProjects(newList);
        localStorage.setItem('electro_projects_list', JSON.stringify(newList));

        // Remove actual data
        localStorage.removeItem(`electro_comp_${name}`);
        localStorage.removeItem(`electro_wire_${name}`);
        localStorage.removeItem(`electro_chat_${name}`);

        if (currentProject === name) {
            setCurrentProject(newList[0] || 'Default Project');
            if (newList.length === 0) {
                const resetList = ['Default Project'];
                setProjects(resetList);
                localStorage.setItem('electro_projects_list', JSON.stringify(resetList));
            }
        }
    };

    return (
        <header className="h-16 bg-(--header-bg) backdrop-blur-md border-b border-(--border-color) flex items-center justify-between px-6 z-50 shadow-sm transition-all duration-300">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 group select-none">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-white font-black text-xl italic">E</span>
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-(--text-primary)">
                    Electro<span className="text-blue-600">AI</span>
                </h1>
            </div>

            {/* Project Selector */}
            <div className="relative">
                <button
                    onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2 bg-(--bg-secondary) border border-(--border-color) rounded-2xl hover:border-blue-500 transition-all duration-300 group shadow-sm cursor-pointer"
                >
                    <FaFolderOpen className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] text-(--text-secondary) font-bold uppercase tracking-wider mb-0.5">Active Project</span>
                        <span className="text-xs font-black text-(--text-primary) max-w-[120px] truncate">{currentProject}</span>
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isProjectMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsProjectMenuOpen(false)} />
                        <div className="absolute top-14 left-0 w-80 bg-(--card-bg) border border-(--border-color) rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-(--border-color) bg-(--bg-secondary)/50">
                                <h3 className="text-xs font-black text-(--text-secondary) uppercase tracking-widest mb-3">Create New</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        placeholder="Project Name..."
                                        className="flex-1 bg-(--bg-primary) border border-(--border-color) rounded-xl px-3 py-2 text-xs text-(--text-primary) focus:border-blue-500 outline-none transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && addNewProject()}
                                    />
                                    <button
                                        onClick={addNewProject}
                                        className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90 shadow-lg shadow-blue-500/20"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-80 overflow-y-auto p-2 no-scrollbar">
                                <h3 className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest p-2">Your Projects</h3>
                                {projects.map((name) => (
                                    <div
                                        key={name}
                                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1 ${currentProject === name ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-(--bg-secondary)'}`}
                                        onClick={() => {
                                            if (editingProject !== name) {
                                                setCurrentProject(name);
                                                setIsProjectMenuOpen(false);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                            <div className={`shrink-0 w-2 h-2 rounded-full ${currentProject === name ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-400'}`} />
                                            {editingProject === name ? (
                                                <input
                                                    autoFocus
                                                    className="bg-(--bg-primary) border border-blue-500 rounded px-2 py-0.5 text-xs text-(--text-primary) w-full outline-none"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') renameProject(name);
                                                        if (e.key === 'Escape') setEditingProject(null);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span className={`text-xs font-bold truncate ${currentProject === name ? 'text-blue-500' : 'text-(--text-primary)'}`}>{name}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            {editingProject === name ? (
                                                <button onClick={(e) => { e.stopPropagation(); renameProject(name); }} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg"><FaCheck size={12} /></button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingProject(name);
                                                        setEditValue(name);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => deleteProject(e, name)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Actions Bar - Reordered: Run on the far right */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleExportCircuit}
                    className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-(--border-color) active:scale-90 cursor-pointer"
                    title="Export Circuit (JSON)"
                >
                    <FaDownload />
                </button>

                <div className="relative">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImportCircuit}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        title="Import Circuit (JSON)"
                    />
                    <button
                        className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-300 border border-(--border-color) active:scale-90 cursor-pointer"
                        title='Import Circuit (JSON)'
                    >
                        <FaUpload />
                    </button>
                </div>

                <div className="w-px h-6 bg-(--border-color) mx-1" />

                <button
                    onClick={handleSaveImage}
                    className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 border border-(--border-color) active:scale-90 cursor-pointer"
                    title="Save as Image"
                >
                    <FaSave />
                </button>

                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl hover:bg-amber-500 hover:text-white transition-all duration-300 border border-(--border-color) active:scale-90 cursor-pointer"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>

                <button
                    onClick={() => setIsPreviewMode(true)}
                    className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl hover:bg-indigo-500 hover:text-white transition-all duration-300 border border-(--border-color) active:scale-90 cursor-pointer"
                    title="Preview Mode"
                >
                    <FaEye />
                </button>

                <button
                    onClick={toggleFullscreen}
                    className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl hover:bg-violet-600 hover:text-white transition-all duration-300 border border-(--border-color) active:scale-90 cursor-pointer"
                    title="Full Screen"
                >
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>

                <div className="w-px h-6 bg-(--border-color) mx-1" />

                <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 cursor-pointer ${isSimulating
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'
                        }`}
                >
                    {isSimulating ? <FaStop /> : <FaPlay />}
                    {isSimulating ? 'STOP' : 'RUN'}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </header>
    )
}

export default Header
