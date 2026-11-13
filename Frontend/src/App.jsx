import { useState } from 'react'
import Listado from './Listado'

// Cada fase siguiente añade una pestaña aquí.
const PESTANAS = [
  ['listado', 'Partidos'],
]

export default function App() {
  const [pestana, setPestana] = useState('listado')

  return (
    <>
      <header className="cabecera">
        <h1>⚽ Fútbol Stats</h1>
        <p>Partidos de las 5 grandes ligas europeas · football-data.co.uk</p>
      </header>

      <nav className="pestanas">
        {PESTANAS.map(([clave, nombre]) => (
          <button
            key={clave}
            className={pestana === clave ? 'activa' : ''}
            onClick={() => setPestana(clave)}
          >
            {nombre}
          </button>
        ))}
      </nav>

      <main>
        {pestana === 'listado' && <Listado />}
      </main>
    </>
  )
}