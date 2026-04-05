import { useState } from 'react'
import styles from './Parametros.module.css'

function ParametroCard({ icono, label, desc, value, setValue, min, max, step, unit, onEnviar, topic, multiplicador }) {

  const [enviado, setEnviado] = useState(false)
  const [inputVal, setInputVal] = useState(value)

  const handleSlider = (e) => {
    const v = parseFloat(e.target.value)
    setInputVal(v)
    setValue(v)
  }

  const handleInput = (e) => {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) {
      const clamped = Math.min(max, Math.max(min, v))
      setInputVal(clamped)
      setValue(clamped)
    } else {
      setInputVal(e.target.value)
    }
  }

  const handleEnviar = () => {
    const valorFinal = multiplicador ? value * multiplicador : value
    onEnviar(topic, valorFinal)
    setEnviado(true)
    setTimeout(() => setEnviado(false), 2000)
  }

  const porcentaje = ((value - min) / (max - min)) * 100

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icono}</span>
        <div>
          <div className={styles.cardLabel}>{label}</div>
          <div className={styles.cardDesc}>{desc}</div>
        </div>
        <div className={styles.cardValor}>
          <input
            type="number"
            className={styles.numInput}
            value={inputVal}
            min={min}
            max={max}
            step={step}
            onChange={handleInput}
            onBlur={() => setInputVal(value)}
          />
          <span className={styles.cardUnit}>{unit}</span>
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSlider}
          className={styles.slider}
          style={{ '--pct': `${porcentaje}%` }}
        />
        <div className={styles.sliderMinMax}>
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>

      {multiplicador && (
        <div className={styles.nota}>
          ℹ️ Se enviará al ESP32 como <strong>{(value * multiplicador).toFixed(0)}</strong> (x{multiplicador})
        </div>
      )}

      <button
        className={`${styles.btnEnviar} ${enviado ? styles.enviado : ''}`}
        onClick={handleEnviar}
      >
        {enviado ? '✓ Enviado al ESP32' : 'Enviar umbral'}
      </button>
    </div>
  )
}

export default function Parametros({ onEnviar, setpoints, setSetpoints }) {

  return (
    <div className={styles.wrapper}>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Parámetros del sistema</h2>
        <p className={styles.sectionDesc}>
          Define los umbrales que usa el ESP32 para activar el riego automáticamente.
          El riego se activa si la humedad baja del umbral <strong>O</strong> si la temperatura sube del umbral.
        </p>
      </section>

      <div className={styles.cardsGrid}>
        <ParametroCard
          icono="💧"
          label="Umbral de Humedad"
          desc="Riego se activa cuando la humedad baja de este valor"
          value={setpoints.humedad}
          setValue={(v) => setSetpoints(prev => ({ ...prev, humedad: v }))}
          min={0}
          max={100}
          step={1}
          unit="%"
          topic="SETPOINT_HUM"
          onEnviar={onEnviar}
          multiplicador={null}
        />
        <ParametroCard
          icono="🌡️"
          label="Umbral de Temperatura"
          desc="Riego se activa cuando la temperatura sube de este valor"
          value={setpoints.temperatura}
          setValue={(v) => setSetpoints(prev => ({ ...prev, temperatura: v }))}
          min={10}
          max={50}
          step={0.5}
          unit="°C"
          topic="SETPOINT_TEMP"
          onEnviar={onEnviar}
          multiplicador={10}
        />
      </div>

      {/* RESUMEN */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuración actual</h2>
        <div className={styles.resumenCard}>
          <div className={styles.resumenRow}>
            <span className={styles.resumenLabel}>💧 Umbral humedad</span>
            <span className={styles.resumenVal}>
              Regar si humedad &lt; <strong>{setpoints.humedad}%</strong>
            </span>
          </div>
          <div className={styles.resumenDivider} />
          <div className={styles.resumenRow}>
            <span className={styles.resumenLabel}>🌡️ Umbral temperatura</span>
            <span className={styles.resumenVal}>
              Regar si temperatura &gt; <strong>{setpoints.temperatura}°C</strong>
            </span>
          </div>
          <div className={styles.resumenDivider} />
          <div className={styles.resumenRow}>
            <span className={styles.resumenLabel}>⚙️ Lógica</span>
            <span className={styles.resumenVal}>Humedad OR Temperatura activa el riego</span>
          </div>
        </div>
      </section>

    </div>
  )
}