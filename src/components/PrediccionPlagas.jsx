import { useState, useEffect } from 'react'
import styles from './PrediccionPlagas.module.css'

// ── Configuración de plagas ──────────────────────────────────
const PLAGAS_INFO = {
  arana_roja: {
    nombre: 'Araña roja',
    icono: '🕷️',
    descripcion: 'Ácaro que prolifera en ambientes secos y cálidos. Ataca hojas y brotes.',
    color: '#ef4444',
    bg: '#fef2f2',
    acciones: [
      'Aumentar la humedad ambiental por encima del 60%',
      'Aplicar acaricida a base de aceite de neem',
      'Revisar el envés de las hojas',
      'Aislar los ejemplares afectados',
    ],
  },
  trips: {
    nombre: 'Trips',
    icono: '🦗',
    descripcion: 'Insecto pequeño que daña flores y brotes nuevos en ambientes secos.',
    color: '#f97316',
    bg: '#fff7ed',
    acciones: [
      'Aplicar insecticida sistémico',
      'Revisar flores y brotes jóvenes',
      'Colocar trampas azules adhesivas',
      'Mejorar la ventilación del área',
    ],
  },
  oidio: {
    nombre: 'Oídio',
    icono: '🍄',
    descripcion: 'Hongo que aparece como polvo blanco. Necesita humedad alta y temperatura moderada.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    acciones: [
      'Reducir el riego y mejorar el drenaje',
      'Mejorar la ventilación del vivero',
      'Aplicar fungicida cúprico o azufre',
      'Evitar mojar el follaje al regar',
    ],
  },
  pudricion_raiz: {
    nombre: 'Pudrición de raíz',
    icono: '🌱',
    descripcion: 'Hongo del suelo que ataca la raíz cuando el sustrato está encharcado y caliente.',
    color: '#78350f',
    bg: '#fefce8',
    acciones: [
      'Reducir el riego INMEDIATAMENTE',
      'Verificar que el drenaje funcione',
      'Aplicar fungicida al sustrato',
      'Revisar las raíces en busca de zonas oscuras',
    ],
  },
  cochinilla: {
    nombre: 'Cochinilla harinosa',
    icono: '🐛',
    descripcion: 'Escama que coloniza plantas bajo estrés hídrico. Se ve como algodón blanco.',
    color: '#be185d',
    bg: '#fdf2f8',
    acciones: [
      'Limpiar con bastoncillo de algodón con alcohol',
      'Aplicar aceite de neem diluido',
      'Aumentar la frecuencia de riego',
      'Revisar cogollos y uniones de ramas',
    ],
  },
  ninguna: {
    nombre: 'Sin plaga detectada',
    icono: '✅',
    descripcion: 'Las condiciones ambientales actuales no favorecen el desarrollo de plagas.',
    color: '#16a34a',
    bg: '#f0fdf4',
    acciones: [],
  },
}

const RIESGO_CONFIG = {
  alto:  { color: '#ef4444', bg: '#fef2f2', borde: '#fca5a5', etiqueta: 'Alto',  icono: '🔴' },
  medio: { color: '#f59e0b', bg: '#fffbeb', borde: '#fcd34d', etiqueta: 'Medio', icono: '🟡' },
  bajo:  { color: '#16a34a', bg: '#f0fdf4', borde: '#86efac', etiqueta: 'Bajo',  icono: '🟢' },
}

// ── Subcomponentes ───────────────────────────────────────────

function BarraProbabilidad({ label, valor, color }) {
  return (
    <div className={styles.barraRow}>
      <span className={styles.barraLabel}>{label}</span>
      <div className={styles.barraTrack}>
        <div
          className={styles.barraFill}
          style={{ width: `${Math.round(valor * 100)}%`, background: color }}
        />
      </div>
      <span className={styles.barraVal}>{Math.round(valor * 100)}%</span>
    </div>
  )
}

function SensorChip({ icono, label, valor, unit, alerta }) {
  return (
    <div className={styles.chip} style={{ borderColor: alerta ? '#fca5a5' : undefined }}>
      <span className={styles.chipIcon}>{icono}</span>
      <div>
        <div className={styles.chipLabel}>{label}</div>
        <div className={styles.chipVal} style={{ color: alerta ? '#ef4444' : undefined }}>
          {valor ?? '--'}{unit}
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────
export default function PrediccionPlagas({ prediccion, data }) {

  const [historial, setHistorial] = useState([])

  // Acumular historial de predicciones (últimas 10)
  useEffect(() => {
    if (!prediccion) return
    setHistorial(prev => {
      const nueva = { ...prediccion, hora: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
      return [nueva, ...prev].slice(0, 10)
    })
  }, [prediccion])

  // Si aún no llegó ninguna predicción
  if (!prediccion) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.esperando}>
          <span className={styles.esperandoIcon}>🧠</span>
          <h2 className={styles.esperandoTitulo}>Esperando predicción...</h2>
          <p className={styles.esperandoDesc}>
            El modelo está analizando las condiciones ambientales.<br />
            La primera predicción llegará en unos segundos.
          </p>
        </div>
      </div>
    )
  }

  const riesgoConf = RIESGO_CONFIG[prediccion.riesgo] || RIESGO_CONFIG.bajo
  const plagaInfo  = PLAGAS_INFO[prediccion.plaga]    || PLAGAS_INFO.ninguna

  return (
    <div className={styles.wrapper}>

      {/* ── TÍTULO ─────────────────────────────────────────── */}
      <div className={styles.header}>
        <h2 className={styles.titulo}>🧠 IA Detección de Plagas</h2>
        <span className={styles.timestamp}>
          Última actualización: {prediccion.timestamp
            ? new Date(prediccion.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : '--'}
        </span>
      </div>

      <div className={styles.grid}>

        {/* ── COLUMNA IZQUIERDA ──────────────────────────── */}
        <div className={styles.colLeft}>

          {/* Nivel de riesgo */}
          <div className={styles.card} style={{ background: riesgoConf.bg, borderColor: riesgoConf.borde }}>
            <div className={styles.cardLabel}>Nivel de riesgo</div>
            <div className={styles.riesgoNivel} style={{ color: riesgoConf.color }}>
              {riesgoConf.icono} {riesgoConf.etiqueta}
            </div>
            <div className={styles.accion}>{prediccion.accion}</div>
          </div>

          {/* Plaga detectada */}
          <div className={styles.card} style={{ background: plagaInfo.bg, borderColor: plagaInfo.color + '55' }}>
            <div className={styles.cardLabel}>Plaga probable</div>
            <div className={styles.plagaNombre} style={{ color: plagaInfo.color }}>
              {plagaInfo.icono} {plagaInfo.nombre}
            </div>
            <p className={styles.plagaDesc}>{plagaInfo.descripcion}</p>

            {plagaInfo.acciones.length > 0 && (
              <>
                <div className={styles.accionesTitle}>Acciones recomendadas:</div>
                <ul className={styles.accionesList}>
                  {plagaInfo.acciones.map((a, i) => (
                    <li key={i} className={styles.accionItem}>
                      <span className={styles.accionBullet} style={{ background: plagaInfo.color }} />
                      {a}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Probabilidades */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Confianza del modelo</div>
            <BarraProbabilidad label="Riesgo alto"  valor={prediccion.prob_alto  ?? 0} color="#ef4444" />
            <BarraProbabilidad label="Riesgo medio" valor={prediccion.prob_medio ?? 0} color="#f59e0b" />
            <BarraProbabilidad label="Riesgo bajo"  valor={prediccion.prob_bajo  ?? 0} color="#16a34a" />
          </div>

        </div>

        {/* ── COLUMNA DERECHA ────────────────────────────── */}
        <div className={styles.colRight}>

          {/* Sensores actuales */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Condiciones actuales de los sensores</div>
            <div className={styles.chipsGrid}>
              <SensorChip
                icono="🌡️" label="Temp. suelo"
                valor={data?.TEMPERATURA} unit="°C"
                alerta={data?.TEMPERATURA > 30}
              />
              <SensorChip
                icono="💧" label="Humedad suelo"
                valor={data?.HUMEDAD} unit="%"
                alerta={data?.HUMEDAD < 20}
              />
              <SensorChip
                icono="🌤️" label="Temp. ambiente"
                valor={data?.TEMP_AMBIENTE} unit="°C"
                alerta={data?.TEMP_AMBIENTE > 28}
              />
              <SensorChip
                icono="🌫️" label="Hum. ambiente"
                valor={data?.HUMEDAD_AMBIENTE} unit="%"
                alerta={data?.HUMEDAD_AMBIENTE < 40 || data?.HUMEDAD_AMBIENTE > 80}
              />
            </div>
          </div>

          {/* Historial de predicciones */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Historial de predicciones</div>
            {historial.length === 0
              ? <div className={styles.sinHistorial}>Sin registros aún</div>
              : (
                <div className={styles.historialList}>
                  {historial.map((h, i) => {
                    const rc = RIESGO_CONFIG[h.riesgo] || RIESGO_CONFIG.bajo
                    const pi = PLAGAS_INFO[h.plaga]    || PLAGAS_INFO.ninguna
                    return (
                      <div key={i} className={styles.historialRow}>
                        <span className={styles.historialHora}>{h.hora}</span>
                        <span className={styles.historialRiesgo} style={{ color: rc.color }}>
                          {rc.icono} {rc.etiqueta}
                        </span>
                        <span className={styles.historialPlaga}>
                          {pi.icono} {pi.nombre}
                        </span>
                        <span className={styles.historialProb}>
                          {Math.round((h.prob_alto ?? 0) * 100)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </div>

        </div>
      </div>
    </div>
  )
}