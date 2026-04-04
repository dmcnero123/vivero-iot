import { useState } from 'react'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SensorCard from '../components/SensorCard'
import StatusCard from '../components/StatusCard'
import SetpointControl from '../components/SetpointControl'
import ManualControl from '../components/ManualControl'
import ChartCard from '../components/ChartCard'
import UserManager from '../components/UserManager'

import styles from './Dashboard.module.css'

export default function Dashboard({ data, history, connected, onConectar, onEnviar, session, onLogout }) {

    const [view, setView] = useState('dashboard')

    if (view === 'usuarios') {
        return (
            <div className={styles.layout}>
                <Sidebar connected={connected} setView={setView} view={view} />

                <main className={styles.main}>
                    <Header connected={connected} onConectar={onConectar} />

                    {/* USER BAR */}
                    <div className={styles.userBar}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>
                                {session?.profile?.nombre}
                            </span>
                            <span className={styles.userRole}>
                                {session?.profile?.rol}
                            </span>
                        </div>

                        <button className={styles.logoutBtn} onClick={onLogout}>
                            Cerrar sesión
                        </button>
                    </div>

                    <div className={styles.content}>
                        <h2 className={styles.sectionTitle}>Gestión de Usuarios</h2>
                        <UserManager />
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className={styles.layout}>
            <Sidebar connected={connected} setView={setView} view={view} />

            <main className={styles.main}>
                <Header connected={connected} onConectar={onConectar} />

                {/* USER BAR */}
                <div className={styles.userBar}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>
                            {session?.profile?.nombre}
                        </span>

                        <span className={styles.userRole}>
                            {session?.profile?.rol}
                        </span>
                    </div>

                    <button className={styles.logoutBtn} onClick={onLogout}>
                        Cerrar sesión
                    </button>
                </div>

                <div className={styles.content}>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Suelo</h2>
                        <div className={styles.cardRow}>
                            <SensorCard label="Temperatura suelo" value={data.TEMPERATURA ?? '--'} unit="°C" icon="🌡️" color="green" />
                            <SensorCard label="Humedad suelo" value={data.HUMEDAD ?? '--'} unit="%" icon="💧" color="blue" />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Ambiente</h2>
                        <div className={styles.cardRow}>
                            <SensorCard label="Temperatura ambiente" value={data.TEMP_AMBIENTE ?? '--'} unit="°C" icon="🌤️" color="amber" />
                            <SensorCard label="Humedad ambiente" value={data.HUMEDAD_AMBIENTE ?? '--'} unit="%" icon="🌫️" color="teal" />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Dispositivos</h2>
                        <div className={styles.statusRow}>
                            <StatusCard label="Bomba" value={data.BOMBA} icon="⚙️" activeLabel="Encendida" inactiveLabel="Apagada" />
                            <StatusCard label="Válvula" value={data.VALVULA} icon="🔧" activeLabel="Abierta" inactiveLabel="Cerrada" />
                            <StatusCard label="PIR" value={data.PIR} icon="👁️" activeLabel="Movimiento" inactiveLabel="Sin movimiento" />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Historial</h2>
                        <div className={styles.chartGrid}>
                            <ChartCard title="Temperatura suelo" data={history.TEMPERATURA} unit="°C" color="#2d8a45" />
                            <ChartCard title="Humedad suelo" data={history.HUMEDAD} unit="%" color="#1976d2" />
                            <ChartCard title="Temp. ambiente" data={history.TEMP_AMBIENTE} unit="°C" color="#f59e0b" />
                            <ChartCard title="Hum. ambiente" data={history.HUMEDAD_AMBIENTE} unit="%" color="#0891b2" />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Control</h2>
                        <div className={styles.controlGrid}>
                            <SetpointControl
                                label="Setpoint Temperatura"
                                topic="SETPOINT_TEMP"
                                value={25}
                                min={10}
                                max={50}
                                step={0.5}
                                unit="°C"
                                onEnviar={onEnviar}
                            />
                            <SetpointControl
                                label="Setpoint Humedad"
                                topic="SETPOINT_HUM"
                                value={30}
                                min={0}
                                max={100}
                                step={1}
                                unit="%"
                                onEnviar={onEnviar}
                            />
                            <ManualControl onEnviar={onEnviar} />
                        </div>
                    </section>

                </div>
            </main>
        </div>
    )
}