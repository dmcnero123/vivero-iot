import { useState } from 'react'
import styles from './ManualControl.module.css'

export default function ManualControl({ onEnviar }) {
  const [mode, setMode] = useState(0)

  const handleMode = (val) => {
    setMode(val)
    onEnviar('MANUAL', val)
  }

  return (
    <div className={styles.card}>
      <div className={styles.label}>Control manual bomba</div>
      <div className={styles.desc}>Sobrescribe el control automático del ESP32</div>

      <div className={styles.btnGroup}>
        <button
          className={`${styles.btn} ${mode === 1 ? styles.activeOn : ''}`}
          onClick={() => handleMode(1)}
        >
          ⚙️ Forzar ON
        </button>
        <button
          className={`${styles.btn} ${mode === 0 ? styles.activeAuto : ''}`}
          onClick={() => handleMode(0)}
        >
          🔄 Automático
        </button>
        <button
          className={`${styles.btn} ${mode === 2 ? styles.activeOff : ''}`}
          onClick={() => handleMode(2)}
        >
          🛑 Forzar OFF
        </button>
      </div>

      <div className={styles.status}>
        Modo actual: <strong>
          {mode === 0 ? 'Automático' : mode === 1 ? 'Forzado ON' : 'Forzado OFF'}
        </strong>
      </div>
    </div>
  )
}