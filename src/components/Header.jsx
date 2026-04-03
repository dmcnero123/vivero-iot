import { useState } from 'react'
import styles from './Header.module.css'

export default function Header({ connected, onConectar }) {
  const [url, setUrl] = useState('ws://127.0.0.1:1880/ws/datos')

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Monitoreo en tiempo real · vivero</p>
      </div>

      <div className={styles.connBar}>
        <div className={`${styles.dot} ${connected ? styles.on : ''}`} />
        <input
          className={styles.input}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="ws://IP:1880/ws/datos"
        />
        <button className={styles.btn} onClick={() => onConectar(url)}>
          {connected ? 'Reconectar' : 'Conectar'}
        </button>
      </div>
    </header>
  )
}