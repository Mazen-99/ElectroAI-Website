import React, { useState, useEffect } from 'react'
import Computer from './view/computer'
import Mobile from './view/mobile'

const App = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    
    // --- Tracking Logic ---
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    let userId = localStorage.getItem('electro_user_tracking_id')
    
    const sendPulse = async (action = 'heartbeat') => {
      try {
        const response = await fetch(`${API_URL}/api/analytics/pulse-log-data-x92`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action })
        })
        const data = await response.json()
        if (data.userId && !userId) {
          userId = data.userId
          localStorage.setItem('electro_user_tracking_id', data.userId)
        }
      } catch (err) {
        // Silent fail for tracking
      }
    }

    // Initial start pulse
    sendPulse('start')
    
    // Heartbeat every 30 seconds
    const interval = setInterval(() => sendPulse('heartbeat'), 30000)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="App">
      {isMobile ? <Mobile /> : <Computer />}
    </div>
  )
}

export default App