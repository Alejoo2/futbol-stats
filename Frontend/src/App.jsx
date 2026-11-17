import { useState } from 'react'
import Listado from './Listado'
import Estadisticas from './Estadisticas'
import Posiciones from './Posiciones'

// Cada fase siguiente añade una pestaña aquí.
const PESTANAS = [
  ['listado', 'Partidos'],
  ['estadisticas', 'Estadísticas'],
  ['posiciones', 'Tabla de posiciones'],
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
        {pestana === 'estadisticas' && <Estadisticas />}
        {pestana === 'posiciones' && <Posiciones />}
      </main>
    </>
  )
}