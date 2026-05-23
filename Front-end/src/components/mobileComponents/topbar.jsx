import React, { useState, useEffect } from 'react'
import { FaPlay, FaStop, FaSave, FaSun, FaMoon, FaEye, FaFolderOpen, FaPlus, FaTrash, FaCheck, FaTimes, FaExpand, FaCompress, FaFileImport, FaFileExport } from 'react-icons/fa'
import { toPng } from 'html-to-image'

const TopBar = ({
    isSimulating,
    setIsSimulating,
    theme,
    setTheme,
    isPreviewMode,
    currentProject,
    setCurrentProject,
    onClearAll,
    onImport,
    onExport
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
        if (!canvasElement) return;

        const now = new Date();
        const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
        const timeStr = `${now.getHours() > 12 ? now.getHours() - 12 : now.getHours()}:${now.getMinutes() >= 10 ? now.getMinutes() : '0' + now.getMinutes()}:${now.getSeconds() >= 10 ? now.getSeconds() : '0' + now.getSeconds()} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        const fileName = `${currentProject}_${dateStr}_${timeStr}.png`;

        toPng(canvasElement, {
            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
            cacheBust: true,
            pixelRatio: 2,
        })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = fileName;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => console.error('Save failed:', err));
    };

    const addNewProject = () => {
        if (!newProjectName.trim()) return;
        if (projects.includes(newProjectName.trim())) return;
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
        const newList = projects.map(p => p === oldName ? finalName : p);
        setProjects(newList);
        localStorage.setItem('electro_projects_list', JSON.stringify(newList));

        const compData = localStorage.getItem(`electro_comp_${oldName}`);
        const wireData = localStorage.getItem(`electro_wire_${oldName}`);
        const chatData = localStorage.getItem(`electro_chat_${oldName}`);

        if (compData) localStorage.setItem(`electro_comp_${finalName}`, compData);
        if (wireData) localStorage.setItem(`electro_wire_${finalName}`, wireData);
        if (chatData) localStorage.setItem(`electro_chat_${finalName}`, chatData);

        localStorage.removeItem(`electro_comp_${oldName}`);
        localStorage.removeItem(`electro_wire_${oldName}`);
        localStorage.removeItem(`electro_chat_${oldName}`);

        if (currentProject === oldName) setCurrentProject(finalName);
        setEditingProject(null);
    };

    const deleteProject = (e, name) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${name}"?`)) return;
        const newList = projects.filter(p => p !== name);
        setProjects(newList);
        localStorage.setItem('electro_projects_list', JSON.stringify(newList));
        localStorage.removeItem(`electro_comp_${name}`);
        localStorage.removeItem(`electro_wire_${name}`);
        if (currentProject === name) setCurrentProject(newList[0] || 'Default Project');
    };

    return (
        <div className="h-15 bg-(--header-bg) border-b border-(--border-color) flex items-center px-4 gap-4 overflow-x-auto no-scrollbar whitespace-nowrap z-100 shadow-md">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-2xl italic">E</span>
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-(--text-primary)">
                    Electro<span className="text-blue-600">AI</span>
                </h1>
            </div>

            <div className="w-px h-6 bg-(--border-color) shrink-0" />

            {/* Project Selector */}
            <div className="relative shrink-0">
                <button
                    onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-(--bg-secondary) border border-(--border-color) rounded-xl"
                >
                    <FaFolderOpen className="text-blue-500 text-xs" />
                    <span className="text-sm font-black text-(--text-primary) max-w-[100px] truncate">{currentProject}</span>
                </button>

                {isProjectMenuOpen && (
                    <div className="fixed inset-0 top-14 bg-black/20 backdrop-blur-sm z-110 p-4 flex flex-col gap-4 overflow-hidden">
                        <div className="bg-(--card-bg) rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-black text-(--text-secondary) uppercase tracking-widest">Projects</h3>
                                <button onClick={() => setIsProjectMenuOpen(false)} className="p-2 text-(--text-secondary)"><FaTimes /></button>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="New project..."
                                    className="flex-1 bg-(--bg-primary) border border-(--border-color) rounded-xl px-4 py-2 text-sm text-(--text-primary) outline-none"
                                />
                                <button onClick={addNewProject} className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center"><FaPlus /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                                {projects.map((name) => (
                                    <div
                                        key={name}
                                        className={`flex items-center justify-between p-4 rounded-2xl ${currentProject === name ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-(--bg-secondary)'}`}
                                        onClick={() => {
                                            if (editingProject !== name) {
                                                setCurrentProject(name);
                                                setIsProjectMenuOpen(false);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                            {editingProject === name ? (
                                                <input
                                                    autoFocus
                                                    className="bg-(--bg-primary) border border-blue-500 rounded-lg px-2 py-1 text-sm text-(--text-primary) w-full outline-none"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span className={`text-sm font-bold truncate ${currentProject === name ? 'text-blue-500' : 'text-(--text-primary)'}`}>{name}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 shrink-0 ml-2">
                                            {editingProject === name ? (
                                                <button onClick={(e) => { e.stopPropagation(); renameProject(name); }} className="p-2 text-green-500"><FaCheck /></button>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); setEditingProject(name); setEditValue(name); }} className="p-2 text-blue-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                            )}
                                            <button onClick={(e) => deleteProject(e, name)} className="p-2 text-red-500"><FaTrash /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-px h-6 bg-(--border-color) shrink-0" />

            {/* Play Button */}
            <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 border-2 ${isSimulating
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-green-600 border-green-600 text-white'
                    }`}
            >
                {isSimulating ? <FaStop className="text-xs" /> : <FaPlay className="text-xs translate-x-0.5" />}
            </button>

            {/* Actions */}
            <button onClick={handleSaveImage} className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl border border-(--border-color) shrink-0 active:scale-90"><FaSave /></button>
            <button onClick={() => setIsPreviewMode(true)} className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl border border-(--border-color) shrink-0 active:scale-90"><FaEye /></button>
            <button onClick={toggleFullscreen} className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl border border-(--border-color) shrink-0 active:scale-90">
                {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 bg-(--bg-secondary) text-(--text-secondary) rounded-xl border border-(--border-color) shrink-0 active:scale-90">
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>

            <div className="w-px h-6 bg-(--border-color) shrink-0" />

            {/* Extra Controls */}
            <button
                onClick={() => {
                    if (window.confirm(theme === 'dark' ? 'Are you sure you want to clear the entire circuit?' : 'هل أنت متأكد من مسح الدائرة بالكامل؟')) {
                        onClearAll();
                    }
                }}
                className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shrink-0 active:scale-90"
            >
                <FaTrash />
            </button>

            <button onClick={onImport} className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0 active:scale-90 flex items-center gap-2">
                <FaFileImport className="text-[10px]" /> <span className="text-[10px] font-black uppercase">Import</span>
            </button>

            <button onClick={onExport} className="p-2.5 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 shrink-0 active:scale-90 flex items-center gap-2">
                <FaFileExport className="text-[10px]" /> <span className="text-[10px] font-black uppercase">Export</span>
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    )
}

export default TopBar
