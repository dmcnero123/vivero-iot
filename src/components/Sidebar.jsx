import styles from './Sidebar.module.css'

export default function Sidebar({ connected, setView, view }) {
  return (
    <aside className={styles.sidebar}>
      
      {/* LOGO */}
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🌿</span>
        <div>
          <div className={styles.brandName}>Vivero IoT</div>
          <div className={styles.brandSub}>Sistema de monitoreo</div>
        </div>
      </div>

      {/* NAV */}
      <nav className={styles.nav}>
        
        {/* SENSORES */}
        <span className={styles.navLabel}>Sensores</span>

        <button
          className={`${styles.navItem} ${view === 'dashboard' ? styles.active : ''}`}
          onClick={() => setView('dashboard')}
        >
          🌡️ Temperatura
        </button>

        <button className={styles.navItem}>
          💧 Humedad
        </button>

        <button className={styles.navItem}>
          🌤️ Ambiente
        </button>

        {/* CONTROL */}
        <span className={styles.navLabel}>Control</span>

        <button className={styles.navItem}>
          ⚙️ Dispositivos
        </button>

        <button className={styles.navItem}>
          🎛️ Setpoints
        </button>

        <button className={styles.navItem}>
          🕹️ Manual
        </button>

        {/* ADMIN */}
        <span className={styles.navLabel}>Admin</span>

        <button
          className={`${styles.navItem} ${view === 'usuarios' ? styles.active : ''}`}
          onClick={() => setView('usuarios')}
        >
          👥 Usuarios
        </button>

      </nav>

      {/* FOOTER */}
      <div className={styles.footer}>
        <div className={`${styles.connDot} ${connected ? styles.on : ''}`} />
        <span className={styles.connText}>
          {connected ? 'Conectado' : 'Sin conexión'}
        </span>
      </div>

    </aside>
  )
}