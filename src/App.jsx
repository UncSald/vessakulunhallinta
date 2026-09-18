import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [buttonCount, setButtonCount] = useState(8)
  const [activeButtons, setActiveButtons] = useState(Array(8).fill(false))
  const [times, setTimes] = useState(Array(8).fill(0))
  const [usageCount, setUsageCount] = useState(Array(8).fill(0))
  const [totalActiveTime, setTotalActiveTime] = useState(Array(8).fill(0))
  const [showStats, setShowStats] = useState(true)
  const [timestampLog, setTimestampLog] = useState([])
  const startTimesRef = useRef(Array(8).fill(Date.now()))
  const occupiedStartRef = useRef(Array(8).fill(null))

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000) % 60
    const minutes = Math.floor(ms / 1000 / 60)
    return `${minutes}m ${seconds}s`
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const addButton = () => {
    const newCount = buttonCount + 1
    setButtonCount(newCount)
    setActiveButtons(prev => [...prev, false])
    setTimes(prev => [...prev, 0])
    setUsageCount(prev => [...prev, 0])
    setTotalActiveTime(prev => [...prev, 0])
    startTimesRef.current = [...startTimesRef.current, Date.now()]
    occupiedStartRef.current = [...occupiedStartRef.current, null]
  }

  const removeButton = () => {
    if (buttonCount <= 1) return
    const newCount = buttonCount - 1
    setButtonCount(newCount)
    setActiveButtons(prev => prev.slice(0, newCount))
    setTimes(prev => prev.slice(0, newCount))
    setUsageCount(prev => prev.slice(0, newCount))
    setTotalActiveTime(prev => prev.slice(0, newCount))
    startTimesRef.current = startTimesRef.current.slice(0, newCount)
    occupiedStartRef.current = occupiedStartRef.current.slice(0, newCount)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimes(prevTimes => {
        const newTimes = [...prevTimes]
        for (let i = 0; i < buttonCount; i++) {
          if (!activeButtons[i] && startTimesRef.current[i]) {
            newTimes[i] = Date.now() - startTimesRef.current[i]
          }
        }
        return newTimes
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [activeButtons, buttonCount])

  const toggleButton = (index) => {
    const now = Date.now()
    const isActive = activeButtons[index]
    
    if (isActive) {
      const occupiedStart = occupiedStartRef.current[index]
      if (occupiedStart) {
        setTotalActiveTime(prev => {
          const newTotal = [...prev]
          newTotal[index] = newTotal[index] + (now - occupiedStart)
          return newTotal
        })
        setUsageCount(prev => {
          const newCount = [...prev]
          newCount[index] = newCount[index] + 1
          return newCount
        })
        setTimestampLog(prev => [...prev, { button: index + 1, start: occupiedStart, end: now }])
      }
      startTimesRef.current[index] = now
      occupiedStartRef.current[index] = null
      setTimes(prevTimes => {
        const newTimes = [...prevTimes]
        newTimes[index] = 0
        return newTimes
      })
    } else {
      occupiedStartRef.current[index] = now
      startTimesRef.current[index] = null
      setTimes(prevTimes => {
        const newTimes = [...prevTimes]
        newTimes[index] = 0
        return newTimes
      })
    }
    
    setActiveButtons(prev => {
      const newActive = [...prev]
      newActive[index] = !newActive[index]
      return newActive
    })
  }

  const toggleStats = () => {
    setShowStats(prev => !prev)
  }

  const longestOff = times.reduce((maxIndex, time, index) => 
    index < buttonCount && time > times[maxIndex] ? index : maxIndex, 0
  )

  return (
    <div className="app-container">
      {showStats && (
        <div className="stats-panel">
          <h2>Käyttöhistoria</h2>
          <div className="stats-content">
            {timestampLog.map((entry, i) => (
              <div key={i} className="timestamp-entry">
                Koppi {entry.button}: {formatTimestamp(entry.start)}-{formatTimestamp(entry.end)}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="main-content">
        <h1 className="app-title">Vessakulunhallinta</h1>
        <div className="longest-off">
          Pisimpään vapaana: Koppi nro. {longestOff + 1}
        </div>
        <div className="controls">
          <button className="control-btn" onClick={removeButton}>Poista koppi</button>
          <button className="control-btn" onClick={addButton}>Lisää koppi</button>
          <button className="control-btn" onClick={toggleStats}>
            {showStats ? 'Piilota tilastot' : 'Näytä tilastot'}
          </button>
        </div>
        <div className="button-grid">
          {Array.from({ length: buttonCount }).map((_, index) => (
            <button
              key={index}
              className={`timer-button ${activeButtons[index] ? 'active' : 'inactive'}`}
              onClick={() => toggleButton(index)}
            >
              <div className="button-number">{index + 1}</div>
              <div className="button-time">{formatTime(times[index])}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
