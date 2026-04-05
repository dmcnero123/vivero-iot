import styles from './Sidebar.module.css'

const NAV = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard', icon: '🏠', text: 'Panel Principal' },
      { id: 'telemetria', icon: '📡', text: 'Telemetría' },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { id: 'riego', icon: '💧', text: 'Riego' },
      { id: 'camara', icon: '📷', text: 'Cámara' },
      { id: 'plagas', icon: '🧠', text: 'IA Plagas' },
    ],
  },
  {
    label: 'Datos',
    items: [
      { id: 'historial', icon: '📈', text: 'Registro Histórico' },
      { id: 'reportes', icon: '📄', text: 'Reportes' },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { id: 'parametros', icon: '⚙️', text: 'Parámetros' },
      { id: 'usuarios', icon: '👥', text: 'Usuarios' },
    ],
  },
]

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
        {NAV.map((group) => (
          <div key={group.label}>
            <span className={styles.navLabel}>{group.label}</span>
            {group.items.map((item) => (
              <button
                key={item.id}
                className={`${styles.navItem} ${view === item.id ? styles.active : ''}`}
                onClick={() => setView(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.text}
              </button>
            ))}
          </div>
        ))}
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
