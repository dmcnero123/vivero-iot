import { useState, useEffect, useRef } from 'react'
import styles from './Camara.module.css'

// ── Cambia esta URL cuando tengas la cámara conectada ────────────────
const CAMARA_URL = null  // ej: 'http://192.168.18.201/stream'

function formatFecha(date) {
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatHora(date) {
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function Camara({ data }) {
  const [detecciones, setDetecciones] = useState([])
  const [verCamara, setVerCamara] = useState(false)
  const pirPrevRef = useRef(false)

  const pirActivo = data.PIR === 1 || data.PIR === '1' || data.PIR === true

  // Registra cada vez que el PIR detecta movimiento (flanco de subida)
  useEffect(() => {
    if (pirActivo && !pirPrevRef.current) {
      const ahora = new Date()
      setDetecciones(prev => [{
        id:    Date.now(),
        fecha: formatFecha(ahora),
        hora:  formatHora(ahora),
      }, ...prev].slice(0, 100))
    }
    pirPrevRef.current = pirActivo
  }, [pirActivo])

  return (
    <div className={styles.wrapper}>

      {/* ESTADO PIR */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Estado del sensor</h2>
        <div className={styles.pirCard}>
          <div className={`${styles.pirDot} ${pirActivo ? styles.pirOn : ''}`} />
          <div>
            <div className={styles.pirEstado}>
              {pirActivo ? '🔴 Movimiento detectado' : '🟢 Sin movimiento'}
            </div>
            <div className={styles.pirDesc}>
              Sensor PIR — se registra cada detección automáticamente
            </div>
          </div>
          <div className={styles.pirContador}>
            <span className={styles.pirNum}>{detecciones.length}</span>
            <span className={styles.pirNumLabel}>detecciones hoy</span>
          </div>
        </div>
      </section>

      {/* STREAM CÁMARA */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cámara de seguridad</h2>

        {CAMARA_URL ? (
          <div className={styles.streamBox}>
            <button
              className={styles.btnVer}
              onClick={() => setVerCamara(v => !v)}
            >
              {verCamara ? '⏹ Ocultar cámara' : '▶ Ver cámara en vivo'}
            </button>
            {verCamara && (
              <img
                src={CAMARA_URL}
                alt="Stream cámara"
                className={styles.stream}
              />
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>📷</span>
            <div className={styles.placeholderTitulo}>Cámara no configurada</div>
            <div className={styles.placeholderDesc}>
              Cuando conectes tu cámara, edita la variable <code>CAMARA_URL</code> al
              inicio de <code>Camara.jsx</code> con la URL del stream.
            </div>
            <div className={styles.placeholderEjemplo}>
              Ejemplo: <code>http://192.168.18.201/stream</code>
            </div>
          </div>
        )}
      </section>

      {/* HISTORIAL DETECCIONES */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Historial de detecciones
          {detecciones.length > 0 && (
            <span className={styles.badge}>{detecciones.length}</span>
          )}
        </h2>

        {detecciones.length === 0 ? (
          <div className={styles.sinRegistros}>
            Sin detecciones registradas — el historial aparece automáticamente cuando el PIR detecte movimiento
          </div>
        ) : (
          <div className={styles.tabla}>
            <div className={styles.tablaHeader}>
              <span>#</span>
              <span>Fecha</span>
              <span>Hora</span>
            </div>
            {detecciones.map((d, i) => (
              <div key={d.id} className={styles.tablaRow}>
                <span className={styles.rowNum}>{detecciones.length - i}</span>
                <span>{d.fecha}</span>
                <span className={styles.hora}>{d.hora}</span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}