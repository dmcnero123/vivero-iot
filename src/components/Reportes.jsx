import { useState, useRef } from 'react'
import styles from './Reportes.module.css'

function formatFecha(date) {
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatHora(date) {
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function ahora() {
  return new Date().toISOString().slice(0, 16)
}
function hoyInicio() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 16)
}

export default function Reportes({ history, bitacora = [] }) {
  const [modo, setModo] = useState('hoy')
  const [desde, setDesde] = useState(hoyInicio())
  const [hasta, setHasta] = useState(ahora())
  const [generando, setGenerando] = useState(false)
  const reporteRef = useRef(null)

  const filtrarPorFecha = (arr) => {
    if (modo === 'hoy') {
      const hoy = new Date().toDateString()
      return arr.filter(r => new Date(r.time || r.fecha).toDateString() === hoy)
    }
    const d = new Date(desde)
    const h = new Date(hasta)
    return arr.filter(r => {
      const t = new Date(r.time || r.fecha)
      return t >= d && t <= h
    })
  }

  const tempSuelo  = history?.TEMPERATURA        || []
  const humSuelo   = history?.HUMEDAD            || []
  const tempAmb    = history?.TEMP_AMBIENTE      || []
  const humAmb     = history?.HUMEDAD_AMBIENTE   || []

  const calcStats = (arr) => {
    if (!arr.length) return { min: '--', max: '--', avg: '--' }
    const vals = arr.map(r => parseFloat(r.value)).filter(v => !isNaN(v))
    if (!vals.length) return { min: '--', max: '--', avg: '--' }
    return {
      min: Math.min(...vals).toFixed(1),
      max: Math.max(...vals).toFixed(1),
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    }
  }

  const handleGenerarPDF = async () => {
    setGenerando(true)
    await new Promise(r => setTimeout(r, 300))
    window.print()
    setGenerando(false)
  }

  const statsTS = calcStats(tempSuelo)
  const statsHS = calcStats(humSuelo)
  const statsTA = calcStats(tempAmb)
  const statsHA = calcStats(humAmb)
  const fechaReporte = new Date()

  return (
    <div className={styles.wrapper}>

      {/* CONTROLES — se ocultan al imprimir */}
      <section className={`${styles.section} ${styles.noPrint}`}>
        <h2 className={styles.sectionTitle}>Generar Reporte</h2>

        <div className={styles.controlCard}>
          <div className={styles.modoGroup}>
            <button
              className={`${styles.modoBtn} ${modo === 'hoy' ? styles.modoBtnActivo : ''}`}
              onClick={() => setModo('hoy')}
            >
              📅 Hoy
            </button>
            <button
              className={`${styles.modoBtn} ${modo === 'rango' ? styles.modoBtnActivo : ''}`}
              onClick={() => setModo('rango')}
            >
              📆 Rango de fechas
            </button>
          </div>

          {modo === 'rango' && (
            <div className={styles.rangoGroup}>
              <label className={styles.rangoLabel}>
                Desde
                <input
                  type="datetime-local"
                  className={styles.rangoInput}
                  value={desde}
                  onChange={e => setDesde(e.target.value)}
                />
              </label>
              <label className={styles.rangoLabel}>
                Hasta
                <input
                  type="datetime-local"
                  className={styles.rangoInput}
                  value={hasta}
                  onChange={e => setHasta(e.target.value)}
                />
              </label>
            </div>
          )}

          <button
            className={styles.btnPDF}
            onClick={handleGenerarPDF}
            disabled={generando}
          >
            {generando ? '⏳ Generando...' : '📄 Descargar PDF'}
          </button>
        </div>
      </section>

      {/* REPORTE — esto es lo que se imprime */}
      <div ref={reporteRef} className={styles.reporte}>

        {/* ENCABEZADO */}
        <div className={styles.reporteHeader}>
          <div className={styles.reporteLogo}>🌿 Vivero IoT</div>
          <div className={styles.reporteTitulo}>Reporte de Monitoreo</div>
          <div className={styles.reporteFecha}>
            Generado: {formatFecha(fechaReporte)} {formatHora(fechaReporte)}
          </div>
          <div className={styles.reportePeriodo}>
            Período: {modo === 'hoy'
              ? `Hoy ${formatFecha(new Date())}`
              : `${desde.replace('T', ' ')} — ${hasta.replace('T', ' ')}`}
          </div>
        </div>

        {/* SENSORES */}
        <div className={styles.reporteSeccion}>
          <h3 className={styles.reporteSubtitulo}>📊 Resumen de Sensores</h3>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Mínimo</th>
                <th>Máximo</th>
                <th>Promedio</th>
                <th>Lecturas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🌡️ Temperatura suelo</td>
                <td>{statsTS.min} °C</td>
                <td>{statsTS.max} °C</td>
                <td>{statsTS.avg} °C</td>
                <td>{tempSuelo.length}</td>
              </tr>
              <tr>
                <td>💧 Humedad suelo</td>
                <td>{statsHS.min} %</td>
                <td>{statsHS.max} %</td>
                <td>{statsHS.avg} %</td>
                <td>{humSuelo.length}</td>
              </tr>
              <tr>
                <td>🌤️ Temp. ambiente</td>
                <td>{statsTA.min} °C</td>
                <td>{statsTA.max} °C</td>
                <td>{statsTA.avg} °C</td>
                <td>{tempAmb.length}</td>
              </tr>
              <tr>
                <td>🌫️ Hum. ambiente</td>
                <td>{statsHA.min} %</td>
                <td>{statsHA.max} %</td>
                <td>{statsHA.avg} %</td>
                <td>{humAmb.length}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BITÁCORA DE RIEGO */}
        <div className={styles.reporteSeccion}>
          <h3 className={styles.reporteSubtitulo}>💧 Eventos de Riego</h3>
          {bitacora.length === 0 ? (
            <p className={styles.sinDatos}>Sin eventos de riego registrados en este período.</p>
          ) : (
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Duración</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {bitacora.map((r, i) => (
                  <tr key={i}>
                    <td>{r.fecha}</td>
                    <td>{r.hora}</td>
                    <td>{r.fin}</td>
                    <td>{r.duracion}</td>
                    <td>{r.tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PIE */}
        <div className={styles.reportePie}>
          Sistema de Monitoreo Vivero IoT — Reporte generado automáticamente
        </div>

      </div>
    </div>
  )
}