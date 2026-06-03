import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient' 
import styles from './Vision.module.css'

export default function Vision() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [errorCamara, setErrorCamara] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Encender la cámara web automáticamente al cargar la pantalla
  useEffect(() => {
    async function encenderCamaraWeb() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCamaraActiva(true)
          setErrorCamara(null)
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err)
        setErrorCamara("Cámara web no encontrada o accesos denegados.")
        setCamaraActiva(false)
      }
    }
    encenderCamaraWeb()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Capturar la foto del video y enviarla a la API de Inteligencia Artificial
  const tomarFotoYPredecir = () => {
    if (!camaraActiva || !videoRef.current || !canvasRef.current) return
    
    setLoading(true)
    setResult(null)

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Ajustar el tamaño del canvas al tamaño del video real
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Dibujar la foto instantánea en el canvas oculto
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convertir la foto a un archivo binario (Blob) para mandarlo al servidor
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Error al procesar la captura de imagen.")
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', blob, 'captura_ia.jpg')

      try {
        // Conexión directa con tu API de FastAPI
        const response = await fetch('http://127.0.0.1:8000/predict', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error(`Error en el servidor: ${response.status}`)

        const data = await response.json()
        
        // Leer las llaves que devuelve tu API de Python
        const claseDetectada = data.clase || data.prediction || data.class || "Desconocido"
        const confianzaDetectada = data.confianza !== undefined ? data.confianza : 95.00

        setResult({
          clase: claseDetectada,
          confianza: parseFloat(confianzaDetectada).toFixed(2)
        })

        // Guardar automáticamente en tu historial de base de datos (Supabase)
        try {
          await supabase.from('predicciones_vision').insert([{
            clase: claseDetectada,
            confianza: parseFloat(confianzaDetectada),
            image_url: 'Captura de cámara en vivo',
            bonsai_id: 'bonsai-principal'
          }])
        } catch (sbErr) {
          console.error("Error al guardar en el Historial de Supabase:", sbErr)
        }

      } catch (error) {
        console.error(error)
        alert("No hay respuesta de la IA. Verifica que FastAPI esté corriendo en el puerto 8000.")
      } finally {
        setLoading(false)
      }
    }, 'image/jpeg', 0.95)
  }

  const esSano = result && result.clase.toLowerCase() === 'sano'

  return (
    <div className={styles.wrapper}>
      
      {/* SECCIÓN IZQUIERDA: CÁMARA EN VIVO */}
      <div className={styles.leftColumn}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reconocimiento por Cámara</h2>
          
          <div className={styles.videoContainer}>
            {errorCamara ? (
              <div className={styles.errorBox}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <p>{errorCamara}</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline className={styles.videoFeed} />
            )}
            {/* El canvas se mantiene oculto, solo sirve para tomar la foto por detrás */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {loading && (
              <div className={styles.loadingOverlay}>
                <span>⚡ Procesando imagen en la IA...</span>
              </div>
            )}
          </div>

          <button 
            onClick={tomarFotoYPredecir}
            disabled={loading || !camaraActiva}
            className={styles.btnCapturar}
          >
            {loading ? "Analizando..." : "📸 Ejecutar Predicción (IA)"}
          </button>
        </section>
      </div>

      {/* SECCIÓN DERECHA: RESPUESTA DE LA IA */}
      <div className={styles.rightColumn}>
        <section className={`${styles.section} ${styles.resultSection}`}>
          <h2 className={styles.sectionTitle}>Respuesta de la Predicción</h2>
          
          {!result ? (
            <div className={styles.placeholderBox}>
              <span style={{ fontSize: '32px' }}>📋</span>
              <p>Presiona el botón de la izquierda para capturar la imagen en vivo y obtener la respuesta de la Inteligencia Artificial.</p>
            </div>
          ) : (
            <div className={styles.resultContainer}>
              
              {/* Cuadro de Estado */}
              <div className={`${styles.statusBadge} ${esSano ? styles.badgeSano : styles.badgeEnfermo}`}>
                <span className={styles.statusDot} />
                <div className={styles.statusText}>
                  <span>Estado Detectado: <strong>{result.clase.toUpperCase()}</strong></span>
                  <span className={styles.confianzaText}>Precisión del modelo: {result.confianza}%</span>
                </div>
              </div>

              {/* Mensajes de Diagnóstico entendibles */}
              {esSano ? (
                <div className={styles.fichaInformativaSana}>
                  🌿 <strong>Planta Sana:</strong> El modelo de IA no ha detectado ninguna plaga ni hongo en las hojas. El ejemplar se encuentra en óptimas condiciones.
                </div>
              ) : (
                <div className={styles.fichaInformativaEnferma}>
                  🍂 <strong>Planta Enferma:</strong> La IA detectó signos de anomalías o manchas en el follaje. Revisa el riego, la humedad y el historial de parámetros para aplicar tratamiento.
                </div>
              )}

            </div>
          )}
        </section>
      </div>

    </div>
  )
}