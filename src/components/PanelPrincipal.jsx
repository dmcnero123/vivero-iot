

import styles from './PanelPrincipal.module.css'

const UMBRALES = {
  TEMPERATURA: { min: 10, max: setpoints?.temperatura ?? 25 },
  HUMEDAD:     { min: 0,  max: setpoints?.humedad     ?? 30 },
}

function calcularAlertas(data) {
  const alertas = []

  const temp = parseFloat(data.TEMPERATURA)
  if (!isNaN(temp)) {
    if (temp > UMBRALES.TEMPERATURA.max)
      alertas.push({ tipo: 'danger', icono: '🌡️', texto: `Temperatura suelo alta: ${temp}°C (máx ${UMBRALES.TEMPERATURA.max}°C)` })
    else if (temp < UMBRALES.TEMPERATURA.min)
      alertas.push({ tipo: 'warning', icono: '🌡️', texto: `Temperatura suelo baja: ${temp}°C (mín ${UMBRALES.TEMPERATURA.min}°C)` })
  }

  const hum = parseFloat(data.HUMEDAD)
  if (!isNaN(hum)) {
    if (hum > UMBRALES.HUMEDAD.max)
      alertas.push({ tipo: 'warning', icono: '💧', texto: `Humedad suelo alta: ${hum}% (máx ${UMBRALES.HUMEDAD.max}%)` })
    else if (hum < UMBRALES.HUMEDAD.min)
      alertas.push({ tipo: 'danger', icono: '💧', texto: `Humedad suelo baja: ${hum}% (mín ${UMBRALES.HUMEDAD.min}%)` })
  }

  if (data.PIR === 1 || data.PIR === '1' || data.PIR === true)
    alertas.push({ tipo: 'info', icono: '👁️', texto: 'Movimiento detectado por sensor PIR' })

  if (data.BOMBA === 1 || data.BOMBA === '1' || data.BOMBA === true)
    alertas.push({ tipo: 'info', icono: '⚙️', texto: 'Bomba encendida actualmente' })

  if (data.VALVULA === 1 || data.VALVULA === '1' || data.VALVULA === true)
    alertas.push({ tipo: 'info', icono: '🔧', texto: 'Válvula abierta actualmente' })

  return alertas
}

function calcularRiesgo(alertas) {
  const dangers = alertas.filter(a => a.tipo === 'danger').length
  const warnings = alertas.filter(a => a.tipo === 'warning').length
  if (dangers >= 2) return { nivel: 'Alto',   color: '#ef4444', bg: '#fef2f2' }
  if (dangers === 1 || warnings >= 2) return { nivel: 'Medio', color: '#f59e0b', bg: '#fffbeb' }
  if (warnings === 1) return { nivel: 'Bajo',  color: '#3aab57', bg: '#f0fdf4' }
  return { nivel: 'Normal', color: '#2d8a45', bg: '#f0fdf4' }
}

function ResumenCard({ icono, label, value, unit, color }) {
  return (
    <div className={styles.resumenCard} style={{ borderTopColor: color }}>
      <span className={styles.resumenIcon}>{icono}</span>
      <div className={styles.resumenValue}>{value ?? '--'}<span className={styles.resumenUnit}>{unit}</span></div>
      <div className={styles.resumenLabel}>{label}</div>
    </div>
  )
}

function AlertaItem({ tipo, icono, texto }) {
  const colores = {
    danger:  { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
  }
  const c = colores[tipo] || colores.info
  return (
    <div className={styles.alertaItem} style={{ background: c.bg, borderColor: c.border }}>
      <span className={styles.alertaIcon}>{icono}</span>
      <span className={styles.alertaTexto} style={{ color: c.text }}>{texto}</span>
    </div>
  )
}

export default function PanelPrincipal({ data, setpoints }) {
  const alertas = calcularAlertas(data)
  const riesgo  = calcularRiesgo(alertas)

  return (
    <div className={styles.wrapper}>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Resumen del sistema</h2>
        <div className={styles.resumenGrid}>
          <ResumenCard icono="🌡️" label="Temperatura suelo"  value={data.TEMPERATURA}       unit="°C" color="#2d8a45" />
          <ResumenCard icono="💧" label="Humedad suelo"       value={data.HUMEDAD}           unit="%"  color="#1976d2" />
          <ResumenCard icono="🌤️" label="Temp. ambiente"     value={data.TEMP_AMBIENTE}     unit="°C" color="#f59e0b" />
          <ResumenCard icono="🌫️" label="Hum. ambiente"      value={data.HUMEDAD_AMBIENTE}  unit="%"  color="#0891b2" />
        </div>
      </section>

      <div className={styles.bottomGrid}>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Nivel de riesgo</h2>
          <div className={styles.riesgoCard} style={{ background: riesgo.bg, borderColor: riesgo.color }}>
            <div className={styles.riesgoNivel} style={{ color: riesgo.color }}>
              {riesgo.nivel === 'Alto'   && '🔴'}
              {riesgo.nivel === 'Medio'  && '🟡'}
              {riesgo.nivel === 'Bajo'   && '🟢'}
              {riesgo.nivel === 'Normal' && '✅'}
              {' '}{riesgo.nivel}
            </div>
            <div className={styles.riesgoDesc}>
              {alertas.length === 0
                ? 'Todos los parámetros están dentro del rango normal.'
                : `Se detectaron ${alertas.length} condición${alertas.length > 1 ? 'es' : ''} fuera del rango.`}
            </div>
            <div className={styles.riesgoUmbrales}>
              <span>Temp suelo: {UMBRALES.TEMPERATURA.min}–{UMBRALES.TEMPERATURA.max}°C</span>
              <span>Humedad suelo: {UMBRALES.HUMEDAD.min}–{UMBRALES.HUMEDAD.max}%</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Alertas activas
            {alertas.length > 0 && (
              <span className={styles.alertaBadge}>{alertas.length}</span>
            )}
          </h2>
          <div className={styles.alertasList}>
            {alertas.length === 0
              ? <div className={styles.sinAlertas}>✅ Sin alertas activas</div>
              : alertas.map((a, i) => (
                  <AlertaItem key={i} tipo={a.tipo} icono={a.icono} texto={a.texto} />
                ))
            }
          </div>
        </section>

      </div>
    </div>
  )
}