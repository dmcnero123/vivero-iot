import styles from './StatusCard.module.css'

export default function StatusCard({ label, value, icon, activeLabel = 'Activo', inactiveLabel = 'Inactivo' }) {
  const on = value === 1 || value === true
  const unknown = value === null || value === undefined

  return (
    <div className={`${styles.card} ${on ? styles.on : styles.off}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.label}>{label}</div>
      <div className={styles.badge}>
        <span className={styles.dot} />
        {unknown ? '—' : on ? activeLabel : inactiveLabel}
      </div>
    </div>
  )
}