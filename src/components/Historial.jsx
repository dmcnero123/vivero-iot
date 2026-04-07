import { useState } from 'react'
import styles from './Historial.module.css'

// ── Cambia esta URL cuando tengas Grafana corriendo ──────────────────
// Ejemplo: 'http://192.168.18.200:3000/d/tu-dashboard-id?kiosk'
const GRAFANA_URL = 'http://localhost:4000/d/dfi7lk9hchtkwf/dashboard?orgId=1&refresh=5s&from=1775479795006&to=1775522995006'

export default function Historial() {
  const [urlCustom, setUrlCustom] = useState(GRAFANA_URL || '')
  const [urlActiva, setUrlActiva] = useState(GRAFANA_URL || '')
  const [editando, setEditando] = useState(false)

  const handleAplicar = () => {
    setUrlActiva(urlCustom)
    setEditando(false)
  }

  return (
    <div className={styles.wrapper}>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Registro Histórico</h2>

        {/* BARRA DE URL */}
        <div className={styles.urlBar}>
          {!editando ? (
            <>
              <span className={styles.urlTexto}>
                {urlActiva || 'Sin URL configurada'}
              </span>
              <button
                className={styles.btnEditar}
                onClick={() => setEditando(true)}
              >
                ✏️ Cambiar URL
              </button>
            </>
          ) : (
            <>
              <input
                className={styles.urlInput}
                value={urlCustom}
                onChange={e => setUrlCustom(e.target.value)}
                placeholder="http://192.168.18.x:3000/d/dashboard-id?kiosk"
              />
              <button className={styles.btnAplicar} onClick={handleAplicar}>
                ✓ Aplicar
              </button>
              <button className={styles.btnCancelar} onClick={() => setEditando(false)}>
                ✕
              </button>
            </>
          )}
        </div>
        {/* IFRAME O PLACEHOLDER */}
        {urlActiva ? (
          <div className={styles.iframeBox}>
            <iframe
              src={urlActiva}
              className={styles.iframe}
              title="Grafana Dashboard"
              allowFullScreen
            />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>📈</span>
            <div className={styles.placeholderTitulo}>Grafana no configurado</div>
            <div className={styles.placeholderDesc}>
              Cuando tengas Grafana corriendo localmente, haz clic en
              <strong> "Cambiar URL"</strong> e ingresa la dirección de tu dashboard.
            </div>
            <div className={styles.placeholderPasos}>
              <div className={styles.paso}>
                <span className={styles.pasoNum}>1</span>
                <span>Instala Grafana en tu PC o servidor local</span>
              </div>
              <div className={styles.paso}>
                <span className={styles.pasoNum}>2</span>
                <span>Conecta InfluxDB como fuente de datos en Grafana</span>
              </div>
              <div className={styles.paso}>
                <span className={styles.pasoNum}>3</span>
                <span>Crea tu dashboard y copia la URL con <code>?kiosk</code> al final</span>
              </div>
              <div className={styles.paso}>
                <span className={styles.pasoNum}>4</span>
                <span>Pégala aquí arriba y listo</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}