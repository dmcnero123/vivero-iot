import styles from './Sidebar.module.css'

export default function Sidebar({ connected }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🌿</span>
        <div>
          <div className={styles.brandName}>Vivero IoT</div>
          <div className={styles.brandSub}>Sistema de monitoreo</div>
        </div>
      </div>

      <nav className={styles.nav}>
        <span className={styles.navLabel}>Sensores</span>
        <a className={styles.navItem}>🌡️ Temperatura</a>
        <a className={styles.navItem}>💧 Humedad</a>
        <a className={styles.navItem}>🌤️ Ambiente</a>

        <span className={styles.navLabel}>Control</span>
        <a className={styles.navItem}>⚙️ Dispositivos</a>
        <a className={styles.navItem}>🎛️ Setpoints</a>
        <a className={styles.navItem}>🕹️ Manual</a>
      </nav>

      <div className={styles.footer}>
        <div className={`${styles.connDot} ${connected ? styles.on : ''}`} />
        <span className={styles.connText}>
          {connected ? 'Conectado' : 'Sin conexión'}
        </span>
      </div>
    </aside>
  )
}