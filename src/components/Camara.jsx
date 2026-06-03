import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient' 
import styles from './Camara.module.css'

// URL de tu cámara IP perimetral
const CAMARA_URL = 'rtsp://admin:CODIGO_6_LETRAS@IP_DE_TU_CAMARA:554/H.264'

// Funciones auxiliares para formatear la marca de tiempo de Supabase
function formatFecha(date) {
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatHora(date) {
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function Camara({ data }) {
  const [detecciones, setDetecciones] = useState([])
  const [verCamara, setVerCamara] = useState(false)
  const [usarSimulador, setUsarSimulador] = useState(false)
  
  const pirPrevRef = useRef(false)
  
  // Evalúa el estado del sensor PIR proveniente de las props (Node-RED / WebSocket)
  const pirActivo = data?.PIR === 1 || data?.PIR === '1' || data?.PIR === true

  // 1. Cargar el registro histórico inicial desde Supabase
  useEffect(() => {
    async function obtenerHistorialSupabase() {
      try {
        const { data: registros, error } = await supabase
          .from('historial_pir')
          .select('*')
          .order('id', { ascending: false })
        
        if (!error && registros) {
          setDetecciones(registros)
        }
      } catch (err) {
        console.error("Error al conectar con el histórico de Supabase:", err)
      }
    }
    obtenerHistorialSupabase()
  }, [])

  // 2. Escuchar el estado del hardware en tiempo real e insertar registros de forma automática
  useEffect(() => {
    if (pirActivo && !pirPrevRef.current) {
      const ahora = new Date()
      const nuevaFecha = formatFecha(ahora)
      const nuevaHora = formatHora(ahora)

      // Despliega automáticamente la transmisión en vivo al detectar una intrusión física
      setVerCamara(true)

      async function guardarAlerta() {
        try {
          const { data: insertado, error } = await supabase
            .from('historial_pir')
            .insert([{ fecha: nuevaFecha, hora: nuevaHora }])
            .select()

          if (!error && insertado) {
            // Actualiza el estado local inmediatamente para pintar la fila en la interfaz
            setDetecciones(prev => [insertado[0], ...prev])
          }
        } catch (err) {
          console.error("Error al persistir la detección perimetral:", err)
        }
      }
      guardarAlerta()
    }
    pirPrevRef.current = pirActivo
  }, [pirActivo])

  return (
    <div className={styles.wrapper}>
      
      {/* COLUMNA IZQUIERDA: MONITOREO DE HARDWARE Y STREAM DE VIDEO */}
      <div className={styles.leftColumn}>
        
        {/* PANEL: ESTADO DEL SENSOR */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Estado del sensor PIR</h2>
          <div className={styles.pirCard} style={{
            border: pirActivo ? '2px solid #ef4444' : '1px solid #e2e8f0',
            backgroundColor: pirActivo ? '#fef2f2' : '#ffffff'
          }}>
            <div className={`${styles.pirDot} ${pirActivo ? styles.pirOn : ''}`} />
            <div className={styles.pirInfo}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: pirActivo ? '#b91c1c' : '#1e293b' }}>
                {pirActivo ? '🚨 Movimiento detectado' : '🟢 Monitoreo estable - Sin movimiento'}
              </div>
              <div className={styles.pirDesc}>
                Sensor PIR activo y transmitiendo telemetría de entorno.
              </div>
            </div>
            <div className={styles.pirContador}>
              <span className={styles.pirNum}>{detecciones.length}</span>
              <span className={styles.pirNumLabel}>Alertas</span>
            </div>
          </div>
        </section>

        {/* PANEL: FEED DE VIDEO EN VIVO */}
        <section className={styles.section}>
          <div className={styles.cameraHeader}>
            <h2 className={styles.sectionTitle}>Cámara de seguridad en tiempo real</h2>
            <button
              className={`${styles.btnVer} ${verCamara ? styles.btnActive : ''}`}
              onClick={() => setVerCamara(v => !v)}
            >
              {verCamara ? '⏹ Detener stream' : '▶ Transmisión en vivo'}
            </button>
          </div>

          {verCamara ? (
            <div className={styles.streamContainer}>
              {!usarSimulador ? (
                <img
                  src={CAMARA_URL}
                  alt="Stream de seguridad"
                  className={styles.stream}
                  onError={() => setUsarSimulador(true)}
                />
              ) : (
                <div className={styles.simuladorBox}>
                  <div className={styles.simuladorTag}>🔴 LIVE FEED</div>
                  <span style={{ fontSize: '40px', marginBottom: '8px' }}>🌳</span>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>
                    Transmisión activa por evento de hardware
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.placeholderBox}>
              <span style={{ fontSize: '28px' }}>📷</span>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                Canal cerrado. Active la transmisión en vivo para visualizar el área de cultivo.
              </div>
            </div>
          )}
        </section>
      </div>

      {/* COLUMNA DERECHA: REGISTRO HISTÓRICO DE BASE DE DATOS */}
      <div className={styles.rightColumn}>
        <section className={`${styles.section} ${styles.historySection}`}>
          <h2 className={styles.sectionTitle}>
            Registro Histórico
            {detecciones.length > 0 && <span className={styles.badge}>{detecciones.length}</span>}
          </h2>

          {detecciones.length === 0 ? (
            <div className={styles.sinRegistros}>
              No se registran eventos activos en la base de datos.
            </div>
          ) : (
            <div className={styles.tablaContainer}>
              <div className={styles.tabla}>
                <div className={styles.tablaHeader}>
                  <span>ID</span>
                  <span>Fecha</span>
                  <span>Hora de marca</span>
                </div>
                <div className={styles.tablaBody}>
                  {detecciones.map((d, i) => (
                    <div key={d.id || i} className={styles.tablaRow}>
                      <span className={styles.rowNum}>#{d.id || (detecciones.length - i)}</span>
                      <span>{d.fecha}</span>
                      <span className={styles.hora}>{d.hora}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

    </div>
  )
}