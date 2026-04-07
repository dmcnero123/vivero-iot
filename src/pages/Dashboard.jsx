import { useState } from 'react'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import UserManager from '../components/UserManager'

// Vistas
import PanelPrincipal from '../components/PanelPrincipal'
import Riego from '../components/Riego'
import ChartCard from '../components/ChartCard'
import SetpointControl from '../components/SetpointControl'
import ManualControl from '../components/ManualControl'
import Camara from '../components/Camara'
import Historial from '../components/Historial'
import Parametros from '../components/Parametros'
import Reportes from '../components/Reportes'

import styles from './Dashboard.module.css'

function Proximamente({ titulo, icono }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      gap: '16px',
      color: 'var(--gray-400)',
    }}>
      <span style={{ fontSize: '52px' }}>{icono}</span>
      <h2 style={{ fontSize: '20px', color: 'var(--gray-600)', fontFamily: 'var(--font-display)' }}>
        {titulo}
      </h2>
      <p style={{ fontSize: '13px' }}>Esta sección se construirá en el siguiente paso</p>
    </div>
  )
}

export default function Dashboard({ data, history, connected, onConectar, onEnviar, session, onLogout, setpoints, setSetpoints, bitacora, setBitacora }) {

  const [view, setView] = useState('dashboard')

  const UserBar = (
    <div className={styles.userBar}>
      <div className={styles.userInfo}>
        <span className={styles.userName}>{session?.profile?.nombre}</span>
        <span className={styles.userRole}>{session?.profile?.rol}</span>
      </div>
      <button className={styles.logoutBtn} onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  )

  const renderContent = () => {
    switch (view) {

      case 'dashboard':
        return <PanelPrincipal data={data} setpoints={setpoints} />

      case 'telemetria':
        return (
          <div className={styles.content}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Datos en vivo</h2>
              <div className={styles.chartGrid}>
                <ChartCard title="Temperatura suelo" data={history.TEMPERATURA} unit="°C" color="#2d8a45" />
                <ChartCard title="Humedad suelo" data={history.HUMEDAD} unit="%" color="#1976d2" />
                <ChartCard title="Temp. ambiente" data={history.TEMP_AMBIENTE} unit="°C" color="#f59e0b" />
                <ChartCard title="Hum. ambiente" data={history.HUMEDAD_AMBIENTE} unit="%" color="#0891b2" />
              </div>
            </section>
          </div>
        )

      case 'riego':
        return <Riego data={data} onEnviar={onEnviar} bitacora={bitacora} setBitacora={setBitacora} />

      case 'camara':
        return <Camara data={data} />

      case 'plagas':
        return <Proximamente titulo="IA Detección de Plagas" icono="🧠" />

      case 'historial':
        return <Historial />

      case 'reportes':
        return <Reportes history={history} bitacora={bitacora} />

      case 'parametros':
        return <Parametros onEnviar={onEnviar} setpoints={setpoints} setSetpoints={setSetpoints} />

      case 'usuarios':
        return (
          <div className={styles.content}>
            <h2 className={styles.sectionTitle}>Gestión de Usuarios</h2>
            <UserManager />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar connected={connected} setView={setView} view={view} />
      <main className={styles.main}>
        <Header connected={connected} onConectar={onConectar} />
        {UserBar}
        {renderContent()}
      </main>
    </div>
  )
}
