import { useState } from 'react'
import Acerca from './Acerca'
import Estadisticas from './Estadisticas'
import Listado from './Listado'
import Posiciones from './Posiciones'
import { PROYECTO } from './proyecto'

const PESTANAS = [
  ['listado', 'Partidos'],
  ['estadisticas', 'Estadísticas'],
  ['posiciones', 'Tabla de posiciones'],
  ['acerca', 'Acerca del proyecto'],
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
        {pestana === 'acerca' && <Acerca />}
      </main>

      <footer className="pie">
        Proyecto de <strong>{PROYECTO.autor}</strong> · {PROYECTO.taller}
      </footer>
    </>
  )
}