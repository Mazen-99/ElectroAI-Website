import React, { useState, useRef, useEffect } from 'react'
import { FaTimes, FaPaperPlane, FaRobot, FaUser, FaExclamationTriangle, FaMagic, FaExpandAlt, FaCompressAlt } from 'react-icons/fa'

const AIChat = ({ currentProject }) => {
    const [isOpen, setIsOpen] = useState(false)
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
    const [isBackendOnline, setIsBackendOnline] = useState(true);
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
            {/* Drawer-style Toggle Button (Left Edge) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed left-0 bottom-[50%] w-15 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-r-3xl flex items-center justify-center shadow-2xl z-[200] active:scale-95 border-y-4 border-r-4 border-white/20 transition-all duration-300 animate-in slide-in-from-left"
                >
                    <div className="relative">
                        <FaRobot className="text-3xl" />
                        <div className={`absolute -top-2 -right-1 w-3 h-3 ${isBackendOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full border-2 border-white ${isBackendOnline ? 'animate-pulse' : ''}`} />
                    </div>
                </button>
            )}

            {/* Mobile Expanded View */}
            <div
                className={`
                    fixed left-0 right-0 top-0 bottom-0 z-[300] bg-[var(--bg-primary)] flex flex-col transition-all duration-500 ease-in-out
                    ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
                `}
            >
                {/* Header */}
                <div className="h-16 bg-blue-600 flex items-center justify-between px-6 shrink-0 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <FaRobot className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm">ElectroAI Assistant</h3>
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${isBackendOnline ? 'text-green-300' : 'text-red-300'}`}>
                                {isBackendOnline ? 'Online & Ready' : 'System Offline'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all font-black"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-10 bg-[var(--bg-secondary)]/30 no-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-center gap-2 mb-1 px-1 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {msg.type === 'ai' ? (
                                    <><FaRobot className="text-[10px] text-blue-500" /><span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">ElectroAI</span></>
                                ) : (
                                    <><FaUser className="text-[10px] text-indigo-500" /><span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">You</span></>
                                )}
                            </div>
                            <div
                                dir={isArabic(msg.text) ? 'rtl' : 'ltr'}
                                className={`
                                    max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                                    ${msg.type === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : msg.isError
                                            ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-none'
                                            : 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none'}
                                    ${isArabic(msg.text) ? 'font-arabic' : ''}
                                `}
                            >
                                <p className="whitespace-pre-wrap">{msg.text}</p>

                                {msg.isMissingComponents && (
                                    <div className="mt-3 pt-2 border-t border-blue-500/10">
                                        <a
                                            href={`https://wa.me/${import.meta.env.VITE_DEVELOPER_PHONE}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 font-bold underline decoration-2 underline-offset-4"
                                        >
                                            {isArabic(msg.text) ? 'تواصل مع المطور' : 'Contact with developer'}
                                        </a>
                                    </div>
                                )}
                                <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider opacity-60 ${msg.type === 'user' ? 'text-blue-100 text-left' : 'text-[var(--text-secondary)] text-right'}`}>
                                    {msg.timestamp}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex flex-col items-start animate-pulse">
                            <div className="bg-[var(--card-bg)] p-4 rounded-2xl rounded-tl-none border border-[var(--border-color)] flex items-center gap-3 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                </div>
                                <span className="text-[10px] text-[var(--text-secondary)] italic">
                                    {loadingMessages[loadingMessageIndex]}
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-color)]">
                    <div className="flex items-end gap-2">
                        <textarea
                            rows="1"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                            disabled={!isBackendOnline || isLoading}
                            placeholder={isBackendOnline ? "Ask ElectroAI..." : "System Offline"}
                            className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none resize-none no-scrollbar h-12"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${!input.trim() || isLoading ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white shadow-lg active:scale-90'}`}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                    {!isBackendOnline && (
                        <a
                            href={`https://wa.me/${import.meta.env.VITE_DEVELOPER_PHONE}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 w-full h-10 bg-green-500 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg"
                        >
                            Contact Developer (Server Offline)
                        </a>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </>
    )
}

export default AIChat
