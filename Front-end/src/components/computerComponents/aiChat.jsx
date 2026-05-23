import React, { useState, useRef, useEffect } from 'react'
import { FaTimes, FaPaperPlane, FaRobot, FaUser, FaExclamationTriangle, FaMagic, FaExpandAlt, FaCompressAlt } from 'react-icons/fa'

const AIChat = ({ currentProject }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(`electro_chat_${currentProject}`)
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                type: 'ai',
                text: 'Hello! I am your ElectroAI Assistant. How can I help you build or modify your circuit today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]
    })
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const [isBackendOnline, setIsBackendOnline] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const loadingMessages = [
        "Analyzing circuit logic...",
        "Selecting best components...",
        "Calculating optimal layout...",
        "Routing wires professionally...",
        "Checking electrical standards...",
        "Finalizing your design..."
    ];

    useEffect(() => {
        let interval;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
            }, 3000);
        } else {
            setLoadingMessageIndex(0);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    // Backend health check
    useEffect(() => {
        const checkHealth = async () => {
            const apiUrl = import.meta.env.VITE_API_URL;
            // Don't check if URL is placeholder or not set
            if (!apiUrl || apiUrl.includes('yourBack-endUrl')) {
                setIsBackendOnline(false);
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/api/ai/health`);
                if (!response.ok) throw new Error();
                
                const data = await response.json();
                // Ensure it's our actual backend by checking the JSON content
                setIsBackendOnline(data.status === 'ok');
            } catch (error) {
                setIsBackendOnline(false);
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    // Persist messages whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`electro_chat_${currentProject}`, JSON.stringify(messages))
        }
    }, [messages, currentProject])

    // Reload messages when project changes
    useEffect(() => {
        const saved = localStorage.getItem(`electro_chat_${currentProject}`)
        if (saved) {
            setMessages(JSON.parse(saved))
        } else {
            setMessages([
                {
                    id: 1,
                    type: 'ai',
                    text: 'Hello! I am your ElectroAI Assistant. How can I help you build or modify your circuit today?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ])
        }
    }, [currentProject])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMsg])
        const prompt = input
        setInput('')
        setIsLoading(true)

        try {
            // Get current circuit context from localStorage
            const savedComponents = localStorage.getItem(`electro_comp_${currentProject}`)
            const savedWires = localStorage.getItem(`electro_wire_${currentProject}`)

            let currentCircuit = null
            if (savedComponents && savedWires) {
                try {
                    currentCircuit = {
                        components: JSON.parse(savedComponents),
                        wires: JSON.parse(savedWires)
                    }
                } catch (e) {
                    console.error("Failed to parse current circuit context", e)
                }
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate-circuit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    currentCircuit: currentCircuit
                })
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || "Server error")
            }

            const data = await response.json()

            // Update Canvas
            if (data.circuit) {
                const event = new CustomEvent('electro_import_circuit', {
                    detail: {
                        components: data.circuit.components,
                        wires: data.circuit.wires
                    }
                })
                window.dispatchEvent(event)
            }

            // Add AI response to chat
            const aiMsg = {
                id: Date.now() + 1,
                type: 'ai',
                text: data.explanation || "I've generated the circuit for you. You can see it on the canvas now.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                hasCircuit: !!data.circuit,
                isMissingComponents: data.circuit === null
            }

            setMessages(prev => [...prev, aiMsg])

        } catch (error) {
            console.error("AI Chat Error:", error)
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: `Error: ${error.message}. Please check your connection or backend status.`,
                isError: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

    return (
        <>
            {/* Refactored Toggle Button - Modern & Animated */}
            {!isOpen && (
                <div className="fixed left-6 bottom-28 z-60 group">
                    {/* Pulsing Background Glow */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-700 animate-pulse" />
                    
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative w-13 h-13 bg-linear-to-br from-blue-500 to-indigo-700 text-white border border-white/40 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:scale-110 active:scale-90 group cursor-pointer animate-bounce-slow"
                    >
                        <div className="absolute inset-0 overflow-hidden rounded-3xl">
                            <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-45 group-hover:left-full transition-all duration-1000" />
                        </div>

                        <div className="relative">
                            <FaRobot className="text-3xl group-hover:rotate-12 transition-transform duration-300" />
                            {/* Online Status Badge */}
                            <div className={`absolute -top-3 -right-3 flex items-center justify-center`}>
                                <div className={`relative flex items-center justify-center`}>
                                    <div className={`absolute w-4 h-4 ${isBackendOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full blur-xs animate-ping opacity-75`} />
                                    <div className={`relative w-3.5 h-3.5 ${isBackendOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full border-2 border-white`} />
                                </div>
                            </div>
                        </div>

                        {/* Floating Label on Hover */}
                        <div className="absolute left-full ml-4 px-4 py-2 bg-(--card-bg) border border-(--border-color) text-(--text-primary) rounded-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl backdrop-blur-md">
                            <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                Ask ElectroAI
                            </span>
                        </div>
                    </button>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
            `}} />

            <div
                className={`
                    fixed transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-70 flex flex-col ai-chat-container
                    ${isFullScreen
                        ? 'inset-0 w-screen h-screen rounded-none origin-center'
                        : 'left-4 bottom-28 origin-bottom-left w-[350px] h-[450px]'}
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-10 pointer-events-none'}
                `}
            >
                <div className={`flex flex-col h-full bg-(--card-bg) border border-(--border-color) shadow-[0_20px_50px_rgba(0,0,0,0.15)] opacity-90 overflow-hidden backdrop-blur-xl ${isFullScreen ? 'rounded-none' : 'rounded-4xl'}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-(--border-color) flex items-center justify-between bg-linear-to-r from-blue-600/10 to-indigo-600/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                                <FaRobot className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-md font-black text-(--text-primary)">ElectroAI Assistant</h2>
                                <p className={`text-[10px] ${isBackendOnline ? 'text-green-500' : 'text-red-500'} font-bold uppercase tracking-widest`}>
                                    System is {isBackendOnline ? 'online' : 'offline'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-(--text-secondary) hover:bg-blue-500/10 hover:text-blue-500 cursor-pointer"
                                title={isFullScreen ? "Minimize" : "Fullscreen"}
                            >
                                {isFullScreen ? <FaCompressAlt size={14} /> : <FaExpandAlt size={14} />}
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    setIsFullScreen(false)
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-(--text-secondary) cursor-pointer hover:bg-red-500/10 hover:text-red-500"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="grow p-6 space-y-6 overflow-y-auto no-scrollbar bg-(--bg-secondary)/30">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} group`}
                            >
                                <div className={`flex items-center gap-2 mb-1 px-1 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {msg.type === 'ai' ? (
                                        <><FaRobot className="text-[10px] text-blue-500" /><span className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-tighter">ElectroAI Assistant</span></>
                                    ) : (
                                        <><FaUser className="text-[10px] text-indigo-500" /><span className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-tighter">You</span></>
                                    )}
                                </div>

                                <div
                                    dir={isArabic(msg.text) ? 'rtl' : 'ltr'}
                                    className={`
                                        relative max-w-[90%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md
                                        ${msg.type === 'user'
                                            ? 'bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none'
                                            : msg.isError
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-tl-none'
                                                : 'bg-(--card-bg) text-(--text-primary) border border-(--border-color) rounded-tl-none'}
                                        ${isArabic(msg.text) ? 'text-right font-arabic' : 'text-left'}
                                    `}>
                                    {msg.isError && <FaExclamationTriangle className="inline mr-2" />}
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    
                                    {msg.isMissingComponents && (
                                        <div className={`mt-3 pt-2 border-t border-blue-500/10 flex flex-col ${isArabic(msg.text) ? 'items-end' : 'items-start'}`}>
                                            <a 
                                                href={`https://wa.me/${import.meta.env.VITE_DEVELOPER_PHONE}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 font-bold underline decoration-2 underline-offset-4 hover:text-blue-600 transition-colors"
                                            >
                                                {isArabic(msg.text) ? 'تواصل مع المطور' : 'Contact with developer'}
                                            </a>
                                        </div>
                                    )}

                                    {msg.hasCircuit && (
                                        <div className={`mt-3 pt-3 border-t border-blue-500/10 flex items-center gap-2 text-[10px] font-bold text-blue-500 ${isArabic(msg.text) ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                                            {isArabic(msg.text) ? 'تم تحديث الدائرة على الكانفا' : 'CIRCUIT UPDATED ON CANVAS'}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                                    {msg.timestamp}
                                </span>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex flex-col items-start animate-pulse">
                                <div className="bg-(--card-bg) p-4 rounded-3xl rounded-tl-none border border-(--border-color) flex items-center gap-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                    </div>
                                    <span className="text-xs text-(--text-secondary) italic font-medium transition-all duration-500">
                                        {loadingMessages[loadingMessageIndex]}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-(--border-color) bg-(--card-bg)">
                        <div className="flex items-end gap-2">
                            <div className="relative grow group">
                                <textarea
                                    rows="1"
                                    dir={isArabic(input) ? 'rtl' : 'ltr'}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                    disabled={!isBackendOnline || isLoading}
                                    placeholder={isBackendOnline ? "Make your circut by AI" : "System Offline"}
                                    className={`w-full bg-(--bg-secondary) border border-(--border-color) rounded-2xl py-2.5 px-4 text-sm outline-none focus:border-blue-500/50 transition-all text-(--text-primary) placeholder:text-gray-400 no-scrollbar resize-none ${isArabic(input) ? 'text-right' : 'text-left'} ${!isBackendOnline ? 'cursor-not-allowed opacity-50' : ''}`}
                                />
                            </div>
                            {isBackendOnline ? (
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || isLoading}
                                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md
                                        ${!input.trim() || isLoading
                                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 opacity-50 cursor-not-allowed'
                                            : 'text-white hover:brightness-110 active:scale-90 cursor-pointer bg-blue-500'}
                                    `}
                                >
                                    <FaPaperPlane className={`text-sm ${isLoading ? 'animate-pulse' : ''}`} />
                                </button>
                            ) : (
                                <a
                                    href={`https://wa.me/${import.meta.env.VITE_DEVELOPER_PHONE}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 h-10 px-4 bg-green-500 text-white rounded-xl flex items-center justify-center gap-3 text-xs font-bold hover:bg-green-600 transition-all active:scale-90 shadow-lg shadow-green-500/20"
                                >
                                    Contact
                                </a>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-3 mt-2">
                            <p className="text-[9px] text-(--text-secondary) opacity-50 flex items-center gap-1">
                                <FaMagic className="text-blue-500/50" /> Gemini Powered
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AIChat
