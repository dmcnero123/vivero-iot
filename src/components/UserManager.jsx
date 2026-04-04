import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from './UserManager.module.css'

export default function UserManager() {
  const [users, setUsers] = useState([])
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('empleado')

  // 🔹 cargar usuarios
  const cargarUsuarios = async () => {
    const { data } = await supabase.from('profiles').select('*')
    setUsers(data || [])
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  // 🔹 crear usuario
  const crearUsuario = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    await supabase.from('profiles').insert({
      id: data.user.id,
      nombre,
      rol,
    })

    alert('Usuario creado')
    setNombre('')
    setEmail('')
    setPassword('')
    cargarUsuarios()
  }

  // 🔹 eliminar usuario
  const eliminar = async (id) => {
    await supabase.from('profiles').delete().eq('id', id)
    cargarUsuarios()
  }

  // 🔹 cambiar rol
  const cambiarRol = async (id, nuevoRol) => {
    await supabase
      .from('profiles')
      .update({ rol: nuevoRol })
      .eq('id', id)

    cargarUsuarios()
  }

  return (
    <div className={styles.container}>
      
      <h2 className={styles.title}>Gestión de Usuarios</h2>

      {/* FORM */}
      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="Correo"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <select
          className={styles.select}
          value={rol}
          onChange={e => setRol(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="empleado">Empleado</option>
        </select>

        <button className={styles.createBtn} onClick={crearUsuario}>
          Crear
        </button>
      </div>

      {/* LISTA */}
      <div className={styles.userList}>
        {users.map(u => (
          <div key={u.id} className={styles.userCard}>
            
            <div className={styles.userInfo}>
              <span className={styles.userName}>{u.nombre}</span>
              <span className={styles.userRole}>{u.rol}</span>
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.edit}`}
                onClick={() => cambiarRol(u.id, 'admin')}
              >
                Admin
              </button>

              <button
                className={`${styles.btn} ${styles.edit}`}
                onClick={() => cambiarRol(u.id, 'empleado')}
              >
                Empleado
              </button>

              <button
                className={`${styles.btn} ${styles.delete}`}
                onClick={() => eliminar(u.id)}
              >
                Eliminar
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}