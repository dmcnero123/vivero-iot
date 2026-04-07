import { useState, useEffect, useRef } from 'react'
import styles from './Riego.module.css'
import { supabase } from '../supabaseClient'

// ── Formatea fecha y hora legible ────────────────────────────────────
function formatFecha(date) {
  return date.toLocaleDateString('es', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}
function formatHora(date) {
  return date.toLocaleTimeString('es', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}
function formatDuracion(ms) {
  if (!ms) return '--'
  const seg = Math.floor(ms / 1000)
  const min = Math.floor(seg / 60)
  const s = seg % 60
  if (min === 0) return `${s}s`
  return `${min}m ${s}s`
}

// ── Tarjeta de estado ────────────────────────────────────────────────
function EstadoCard({ icono, label, valor, activo }) {
  return (
    <div className={`${styles.estadoCard} ${activo ? styles.estadoActivo : ''}`}>
      <span className={styles.estadoIcon}>{icono}</span>
      <div className={styles.estadoLabel}>{label}</div>
      <div className={`${styles.estadoValor} ${activo ? styles.valorActivo : ''}`}>
        {valor}
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────
export default function Riego({ data, onEnviar, bitacora, setBitacora }) {
  const bombaActiva = data.BOMBA === 1 || data.BOMBA === '1' || data.BOMBA === true
  const valvulaAbierta = data.VALVULA === 1 || data.VALVULA === '1' || data.VALVULA === true

  // Bitácora de riegos
  const [confirmando, setConfirmando] = useState(false)

  // Tracking de inicio/fin de riego
  const riendoRef = useRef(false)
  const inicioRef = useRef(null)
  const ultimoRef = useRef(null)

  useEffect(() => {
    if (bombaActiva && !riendoRef.current) {
      riendoRef.current = true
      inicioRef.current = new Date()
    }

    if (!bombaActiva && riendoRef.current) {
      riendoRef.current = false
      const fin = new Date()
      const inicio = inicioRef.current
      const duracion = fin - inicio

      const entrada = {
        fecha: formatFecha(inicio),
        hora_inicio: formatHora(inicio),
        hora_fin: formatHora(fin),
        duracion: formatDuracion(duracion),
        tipo: 'Automático',
      }

      // Guarda en Supabase
      supabase.from('bitacora_riego').insert(entrada).then(({ error }) => {
        if (error) console.error('Error guardando bitácora:', error)
      })

      // También actualiza el estado local
      setBitacora(prev => [{ id: Date.now(), ...entrada }, ...prev].slice(0, 50))
      ultimoRef.current = { ...entrada }
    }
  }, [bombaActiva])
  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from('bitacora_riego')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setBitacora(data.map(r => ({
          id: r.id,
          fecha: r.fecha,
          hora: r.hora_inicio,
          fin: r.hora_fin,
          duracion: r.duracion,
          tipo: r.tipo,
        })))
      }
    }
    cargar()
  }, [])

  // Botón forzar riego
  const handleRegar = () => {
    onEnviar('MANUAL', 1)
    // marcamos que el próximo riego será manual
    riendoRef.current = false
    setConfirmando(false)
  }
  const handleDetener = () => {
    onEnviar('MANUAL', 0)
  }

  const ultimo = ultimoRef.current

  return (
    <div className={styles.wrapper}>

      {/* ESTADO ACTUAL */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Estado del riego</h2>
        <div className={styles.estadoGrid}>
          <EstadoCard
            icono="⚙️"
            label="Bomba"
            valor={bombaActiva ? 'Encendida' : 'Apagada'}
            activo={bombaActiva}
          />
          <EstadoCard
            icono="🔧"
            label="Válvula"
            valor={valvulaAbierta ? 'Abierta' : 'Cerrada'}
            activo={valvulaAbierta}
          />
          <EstadoCard
            icono="🕐"
            label="Último riego"
            valor={ultimo ? `${ultimo.fecha} ${ultimo.hora}` : 'Sin registros'}
            activo={false}
          />
          <EstadoCard
            icono="⏱️"
            label="Última duración"
            valor={ultimo ? ultimo.duracion : '--'}
            activo={false}
          />
        </div>
      </section>

      {/* CONTROL MANUAL */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Control manual</h2>
        <div className={styles.controlCard}>
          <div className={styles.controlInfo}>
            <div className={styles.controlTitulo}>Forzar riego</div>
            <div className={styles.controlDesc}>
              Activa la bomba y válvula manualmente, ignorando el control automático del ESP32.
            </div>
          </div>

          <div className={styles.controlBtns}>
            {!bombaActiva ? (
              <>
                {!confirmando ? (
                  <button
                    className={styles.btnRegar}
                    onClick={() => setConfirmando(true)}
                  >
                    💧 Regar ahora
                  </button>
                ) : (
                  <div className={styles.confirmBox}>
                    <span className={styles.confirmText}>¿Confirmar riego manual?</span>
                    <button className={styles.btnConfirmar} onClick={handleRegar}>✓ Confirmar</button>
                    <button className={styles.btnCancelar} onClick={() => setConfirmando(false)}>✕ Cancelar</button>
                  </div>
                )}
              </>
            ) : (
              <button className={styles.btnDetener} onClick={handleDetener}>
                🛑 Detener riego
              </button>
            )}
          </div>

          <div className={styles.modoActual}>
            Modo actual: <strong>{bombaActiva ? 'Riego activo' : 'En espera'}</strong>
          </div>
        </div>
      </section>

      {/* BITÁCORA */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Bitácora de riego
          {bitacora.length > 0 && (
            <span className={styles.badge}>{bitacora.length}</span>
          )}
        </h2>

        {bitacora.length === 0 ? (
          <div className={styles.sinRegistros}>
            Sin registros aún — los riegos aparecerán aquí automáticamente
          </div>
        ) : (
          <div className={styles.tabla}>
            <div className={styles.tablaHeader}>
              <span>Fecha</span>
              <span>Inicio</span>
              <span>Fin</span>
              <span>Duración</span>
              <span>Tipo</span>
            </div>
            {bitacora.map((r) => (
              <div key={r.id} className={styles.tablaRow}>
                <span>{r.fecha}</span>
                <span>{r.hora}</span>
                <span>{r.fin}</span>
                <span className={styles.duracion}>{r.duracion}</span>
                <span className={`${styles.tipo} ${r.tipo === 'Manual' ? styles.tipoManual : styles.tipoAuto}`}>
                  {r.tipo}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
