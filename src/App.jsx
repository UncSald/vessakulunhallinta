import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [buttonCount, setButtonCount] = useState(8)
  const [activeButtons, setActiveButtons] = useState(Array(8).fill(false))
  const [times, setTimes] = useState(Array(8).fill(0))
  const startTimesRef = useRef(Array(8).fill(Date.now()))

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000) % 60
    const minutes = Math.floor(ms / 1000 / 60)
    return `${minutes}m ${seconds}s`
  }

  const addButton = () => {
    const newCount = buttonCount + 1
    setButtonCount(newCount)
    setActiveButtons(prev => [...prev, false])
    setTimes(prev => [...prev, 0])
    startTimesRef.current = [...startTimesRef.current, Date.now()]
  }

  const removeButton = () => {
    if (buttonCount <= 1) return
    const newCount = buttonCount - 1
    setButtonCount(newCount)
    setActiveButtons(prev => prev.slice(0, newCount))
    setTimes(prev => prev.slice(0, newCount))
    startTimesRef.current = startTimesRef.current.slice(0, newCount)
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
      startTimesRef.current[index] = now
      setTimes(prevTimes => {
        const newTimes = [...prevTimes]
        newTimes[index] = 0
        return newTimes
      })
    } else {
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

  const longestOff = times.reduce((maxIndex, time, index) => 
    index < buttonCount && time > times[maxIndex] ? index : maxIndex, 0
  )

  return (
    <div className="app">
      <h1 className="app-title">Vessakulunhallinta</h1>
      <div className="longest-off">
        Pisimpään vapaana: Koppi nro. {longestOff + 1}
      </div>
      <div className="controls">
        <button className="control-btn" onClick={removeButton}>Poista koppi</button>
        <button className="control-btn" onClick={addButton}>Lisää koppi</button>
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
  )
}

export default App
