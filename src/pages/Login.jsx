import { useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from './Login.module.css'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciales incorrectas')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    onLogin({
      user: data.user,
      profile: profile,
    })

    setLoading(false)
  }

  return (
    <div className={styles.container}>
      
      {/* IZQUIERDA */}
      <div className={styles.left}>
        <div className={styles.overlayText}>
          <h1>Bonsái Mania y Estilo Verde 🌱</h1>
          <p>Monitoreo inteligente en tiempo real</p>
        </div>
      </div>

      {/* DERECHA */}
      <div className={styles.right}>
        <form className={styles.card} onSubmit={handleLogin}>
          <h2>Iniciar sesión</h2>

          <input
            className={styles.input}
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className={styles.button} type="submit">
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  )
}