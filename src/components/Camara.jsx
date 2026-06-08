import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Camara.module.css';

const CAMARA_IP = "192.168.1.14";   // ← IP actualizada

export default function Camara({ data }) {
  const [detecciones, setDetecciones] = useState([]);
  const [verCamara, setVerCamara] = useState(false);
  const pirPrevRef = useRef(false);

  const pirActivo = data?.PIR === 1 || data?.PIR === '1' || data?.PIR === true;

  // Cargar historial
  useEffect(() => {
    async function obtenerHistorial() {
      const { data: registros } = await supabase
        .from('historial_pir')
        .select('*')
        .order('id', { ascending: false })
        .limit(20);
      if (registros) setDetecciones(registros);
    }
    obtenerHistorial();
  }, []);

  // Activar cámara al detectar movimiento
  useEffect(() => {
    if (pirActivo && !pirPrevRef.current) {
      setVerCamara(true);
      const ahora = new Date();
      supabase.from('historial_pir').insert([{
        fecha: ahora.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        hora: ahora.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
        tipo: 'Movimiento detectado por PIR'
      }]);
    }
    pirPrevRef.current = pirActivo;
  }, [pirActivo]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftColumn}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Estado del Sensor Perimetral</h2>
          <div className={`${styles.pirCard} ${pirActivo ? styles.pirActive : ''}`}>
            <div className={styles.pirStatus}>
              <div className={`${styles.pirDot} ${pirActivo ? styles.pirOn : ''}`} />
              <div>
                <div className={styles.pirTitle}>
                  {pirActivo ? '🚨 MOVIMIENTO DETECTADO' : '🟢 Monitoreo Estable'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.cameraHeader}>
            <h2 className={styles.sectionTitle}>📹 Cámara Ezviz H3 (go2rtc)</h2>
            <button
              className={`${styles.btnVer} ${verCamara ? styles.btnActive : ''}`}
              onClick={() => setVerCamara(!verCamara)}
            >
              {verCamara ? '⏹ Detener' : '▶ Ver Transmisión'}
            </button>
          </div>

          <div className={styles.streamContainer}>
            {verCamara ? (
              <iframe
                src="http://localhost:1984/stream.html?src=bonsai"
                className={styles.stream}
                title="Cámara go2rtc"
                allowFullScreen
              />
            ) : (
              <div className={styles.placeholderBox}>
                <span className={styles.placeholderIcon}>📷</span>
                <p>Transmisión desactivada</p>
                <p>Presiona el botón para activar la cámara</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className={styles.rightColumn}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Historial de Movimientos
            {detecciones.length > 0 && <span className={styles.badge}>{detecciones.length}</span>}
          </h2>

          {detecciones.length === 0 ? (
            <div className={styles.sinRegistros}>No hay movimientos registrados aún</div>
          ) : (
            <div className={styles.tablaContainer}>
              <div className={styles.tabla}>
                <div className={styles.tablaHeader}>
                  <span>Fecha</span>
                  <span>Hora</span>
                  <span>Evento</span>
                </div>
                <div className={styles.tablaBody}>
                  {detecciones.map((d) => (
                    <div key={d.id} className={styles.tablaRow}>
                      <span>{d.fecha}</span>
                      <span className={styles.hora}>{d.hora}</span>
                      <span>{d.tipo || 'Movimiento detectado'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}