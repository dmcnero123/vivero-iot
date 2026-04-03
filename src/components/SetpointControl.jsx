import { useState } from 'react'
import styles from './SetpointControl.module.css'

export default function SetpointControl({ label, value, min, max, step, unit, topic, onEnviar }) {
  const [local, setLocal] = useState(value)
  const [enviado, setEnviado] = useState(false)

  const handleEnviar = () => {
    onEnviar(topic, local)
    setEnviado(true)
    setTimeout(() => setEnviado(false), 1500)
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          {parseFloat(local).toFixed(step < 1 ? 1 : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={local}
        onChange={(e) => setLocal(parseFloat(e.target.value))}
        className={styles.slider}
      />
      <div className={styles.minmax}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      <button
        className={`${styles.btn} ${enviado ? styles.enviado : ''}`}
        onClick={handleEnviar}
      >
        {enviado ? '✓ Enviado' : 'Enviar setpoint'}
      </button>
    </div>
  )
}