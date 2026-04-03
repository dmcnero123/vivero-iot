import styles from './SensorCard.module.css'

export default function SensorCard({ label, value, unit, icon, color = 'green' }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value ?? '--'}</span>
        <span className={styles.unit}>{unit}</span>
      </div>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: '60%' }} />
      </div>
    </div>
  )
}