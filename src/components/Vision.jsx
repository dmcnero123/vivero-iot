import { useState, useRef } from 'react';
import styles from './Vision.module.css';

export default function Vision() {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  const diagnosticar = async () => {
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      const fd = new FormData();
      fd.append('file', blob, 'img.jpg');
      const r = await fetch('http://127.0.0.1:8000/predict', { method: 'POST', body: fd });
      setRes(await r.json());
      setLoading(false);
    }, 'image/jpeg', 0.5);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <h2>Detección y Diagnóstico</h2>
        <video ref={videoRef} src="http://localhost:1984/api/stream.mp4?src=bonsai" autoPlay muted playsInline className={styles.video} />
        <button onClick={diagnosticar} className={styles.btn} disabled={loading}>
          {loading ? "Analizando..." : "🔍 Diagnóstico Salud del Bonsái"}
        </button>
      </div>

      <div className={styles.panel}>
        {res && (
          <div className={styles.containerFicha}>
            <div className={styles.status}>🔴 Análisis: ENFERMO ({res.confianza} % de confiabilidad)</div>
            <div className={styles.ficha}>
              <h4>📋 Patología Específica Detectada</h4>
              <p><strong>🍃 Plaga:</strong> {res.detalle.titulo}</p>
              <p><strong>🔧 Causa probable:</strong> {res.detalle.causa}</p>
              <p><strong>👁️ Síntomas en imagen:</strong> {res.detalle.sintomas}</p>
              <div className={styles.tratamiento}><strong>🧪 Tratamiento Inmediato:</strong> {res.detalle.tratamiento}</div>
              <p className={styles.footer}><em>💡 *Asegúrate de limpiar tus herramientas con alcohol antes y después de tratar este bonsái para evitar contagios mecánicos.</em></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}