import { useState, useEffect } from 'react'
import styles from './Reportes.module.css'
import { supabase } from '../supabaseClient'

function formatFecha(date) {
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatHora(date) {
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function parsearCSV(csv) {
  const lineas = csv.split('\n').filter(l => l.trim() && !l.startsWith('#'))
  if (lineas.length < 2) return []
  const headers = lineas[0].split(',')
  const fieldIdx = headers.indexOf('_field')
  const valueIdx = headers.indexOf('_value')
  const timeIdx  = headers.indexOf('_time')
  const resultado = {}
  for (let i = 1; i < lineas.length; i++) {
    const cols = lineas[i].split(',')
    const field = cols[fieldIdx]?.trim()
    const value = parseFloat(cols[valueIdx])
    const time  = cols[timeIdx]?.trim()
    if (!field || isNaN(value)) continue
    if (!resultado[field]) resultado[field] = []
    resultado[field].push({ time, value })
  }
  return resultado
}
function calcStats(arr) {
  if (!arr || !arr.length) return { min: '--', max: '--', avg: '--', total: 0 }
  const vals = arr.map(r => r.value).filter(v => !isNaN(v))
  if (!vals.length) return { min: '--', max: '--', avg: '--', total: 0 }
  return {
    min:   Math.min(...vals).toFixed(1),
    max:   Math.max(...vals).toFixed(1),
    avg:   (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    total: vals.length,
  }
}
function hoyInicio() {
  const d = new Date(); d.setHours(0,0,0,0)
  return d.toISOString().slice(0,16)
}
function ahoraStr() {
  return new Date().toISOString().slice(0,16)
}

export default function Reportes() {
  const [modo, setModo]               = useState('hoy')
  const [desde, setDesde]             = useState(hoyInicio())
  const [hasta, setHasta]             = useState(ahoraStr())
  const [datos, setDatos]             = useState(null)
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState(null)
  const [bitacoraLocal, setBitacoraLocal] = useState([])

  // ── Cargar bitácora de Supabase ──────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from('bitacora_riego')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setBitacoraLocal(data.map(r => ({
          fecha:    r.fecha,
          hora:     r.hora_inicio,
          fin:      r.hora_fin,
          duracion: r.duracion,
          tipo:     r.tipo,
        })))
      }
    }
    cargar()
  }, [])

  const fetchDatos = async () => {
    setCargando(true)
    setError(null)
    setDatos(null)
    try {
      let desdeISO, hastaISO
      if (modo === 'hoy') {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        desdeISO = d.toISOString()
        hastaISO = new Date().toISOString()
      } else {
        desdeISO = new Date(desde).toISOString()
        hastaISO = new Date(hasta).toISOString()
      }
      const res = await fetch('http://localhost:1880/api/reporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desde: desdeISO, hasta: hastaISO }),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Error ${res.status}: ${txt}`)
      }
      const csv = await res.text()
      setDatos(parsearCSV(csv))
    } catch (e) {
      setError('Error: ' + e.message)
    } finally {
      setCargando(false)
    }
  }

  const fechaReporte = new Date()
  const statsTS = calcStats(datos?.temperatura)
  const statsHS = calcStats(datos?.humedad)
  const statsTA = calcStats(datos?.temp_ambiente)
  const statsHA = calcStats(datos?.humedad_ambiente)

  return (
    <div className={styles.wrapper}>

      <section className={`${styles.section} ${styles.noPrint}`}>
        <h2 className={styles.sectionTitle}>Generar Reporte</h2>
        <div className={styles.controlCard}>
          <div className={styles.modoGroup}>
            <button
              className={`${styles.modoBtn} ${modo === 'hoy' ? styles.modoBtnActivo : ''}`}
              onClick={() => setModo('hoy')}
            >📅 Hoy</button>
            <button
              className={`${styles.modoBtn} ${modo === 'rango' ? styles.modoBtnActivo : ''}`}
              onClick={() => setModo('rango')}
            >📆 Rango de fechas</button>
          </div>

          {modo === 'rango' && (
            <div className={styles.rangoGroup}>
              <label className={styles.rangoLabel}>
                Desde
                <input type="datetime-local" className={styles.rangoInput}
                  value={desde} onChange={e => setDesde(e.target.value)} />
              </label>
              <label className={styles.rangoLabel}>
                Hasta
                <input type="datetime-local" className={styles.rangoInput}
                  value={hasta} onChange={e => setHasta(e.target.value)} />
              </label>
            </div>
          )}

          <div className={styles.botonesRow}>
            <button className={styles.btnConsultar} onClick={fetchDatos} disabled={cargando}>
              {cargando ? '⏳ Consultando InfluxDB...' : '🔍 Consultar datos'}
            </button>
            {datos && (
              <button className={styles.btnPDF} onClick={() => window.print()}>
                📄 Descargar PDF
              </button>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>
      </section>

      {datos && (
        <div className={styles.reporte}>
          <div className={styles.reporteHeader}>
            <div className={styles.reporteLogo}>🌿 Vivero IoT</div>
            <div className={styles.reporteTitulo}>Reporte de Monitoreo</div>
            <div className={styles.reporteFecha}>
              Generado: {formatFecha(fechaReporte)} {formatHora(fechaReporte)}
            </div>
            <div className={styles.reportePeriodo}>
              Período: {modo === 'hoy'
                ? `Hoy ${formatFecha(new Date())}`
                : `${desde.replace('T',' ')} — ${hasta.replace('T',' ')}`}
            </div>
          </div>

          <div className={styles.reporteSeccion}>
            <h3 className={styles.reporteSubtitulo}>📊 Resumen de Sensores</h3>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Sensor</th><th>Mínimo</th><th>Máximo</th>
                  <th>Promedio</th><th>Lecturas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🌡️ Temperatura suelo</td>
                  <td>{statsTS.min} °C</td><td>{statsTS.max} °C</td>
                  <td>{statsTS.avg} °C</td><td>{statsTS.total}</td>
                </tr>
                <tr>
                  <td>💧 Humedad suelo</td>
                  <td>{statsHS.min} %</td><td>{statsHS.max} %</td>
                  <td>{statsHS.avg} %</td><td>{statsHS.total}</td>
                </tr>
                <tr>
                  <td>🌤️ Temp. ambiente</td>
                  <td>{statsTA.min} °C</td><td>{statsTA.max} °C</td>
                  <td>{statsTA.avg} °C</td><td>{statsTA.total}</td>
                </tr>
                <tr>
                  <td>🌫️ Hum. ambiente</td>
                  <td>{statsHA.min} %</td><td>{statsHA.max} %</td>
                  <td>{statsHA.avg} %</td><td>{statsHA.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.reporteSeccion}>
            <h3 className={styles.reporteSubtitulo}>💧 Eventos de Riego</h3>
            {bitacoraLocal.length === 0 ? (
              <p className={styles.sinDatos}>Sin eventos de riego registrados.</p>
            ) : (
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Fecha</th><th>Inicio</th><th>Fin</th>
                    <th>Duración</th><th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {bitacoraLocal.map((r, i) => (
                    <tr key={i}>
                      <td>{r.fecha}</td><td>{r.hora}</td><td>{r.fin}</td>
                      <td>{r.duracion}</td><td>{r.tipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.reportePie}>
            Sistema de Monitoreo Vivero IoT — Reporte generado automáticamente
          </div>
        </div>
      )}

      {!datos && !cargando && (
        <div className={styles.esperando}>
          <span>🔍</span>
          <p>Selecciona el período y haz clic en <strong>Consultar datos</strong> para generar el reporte</p>
        </div>
      )}

    </div>
  )
}