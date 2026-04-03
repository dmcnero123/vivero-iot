import { useState, useEffect, useRef } from 'react'
import './index.css'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [data, setData] = useState({
    TEMPERATURA: null,
    HUMEDAD: null,
    TEMP_AMBIENTE: null,
    HUMEDAD_AMBIENTE: null,
    PIR: null,
    BOMBA: null,
    VALVULA: null,
  })

  const [history, setHistory] = useState({
    TEMPERATURA: [],
    HUMEDAD: [],
    TEMP_AMBIENTE: [],
    HUMEDAD_AMBIENTE: [],
  })

  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  const conectar = (url) => {
    if (wsRef.current) wsRef.current.close()

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen  = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)

    ws.onmessage = (e) => {
      try {
        const msg     = JSON.parse(e.data)
        const topic   = msg.payload.topic
        const payload = msg.payload.payload

        setData(prev => ({ ...prev, [topic]: payload }))

        const sensoresConHistorial = ['TEMPERATURA', 'HUMEDAD', 'TEMP_AMBIENTE', 'HUMEDAD_AMBIENTE']

        if (sensoresConHistorial.includes(topic)) {
          const time = new Date().toLocaleTimeString('es', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          })
          setHistory(prev => {
            const arr = [...(prev[topic] || []), { time, value: parseFloat(payload) }]
            return { ...prev, [topic]: arr.slice(-50) }
          })
        }
      } catch {}
    }
  }

  useEffect(() => {
    conectar('ws://127.0.0.1:1880/ws/datos')
    return () => wsRef.current?.close()
  }, [])

  const enviar = (topic, valor) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ topic, payload: valor }))
    }
  }

  return (
    <Dashboard
      data={data}
      history={history}
      connected={connected}
      onConectar={conectar}
      onEnviar={enviar}
    />
  )
}