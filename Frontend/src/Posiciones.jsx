import { useEffect, useState } from 'react'
import { construirQuery, pedir } from './api'
import { LIGAS, TEMPORADAS } from './constantes'

export default function Posiciones() {
  const [liga, setLiga] = useState('E0')
  const [temporada, setTemporada] = useState('2023-24')
  const [hasta, setHasta] = useState('')
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    let vigente = true
    setCargando(true)
    setError('')

    pedir(`/posiciones/${construirQuery({ liga, temporada, fecha_hasta: hasta })}`)
      .then(({ ok, datos }) => {
        if (!vigente) return
        if (ok) setDatos(datos)
        else setError(`El servidor rechazó la consulta: ${JSON.stringify(datos)}`)
      })
      .catch(() => vigente && setError('No se pudo conectar con el servidor.'))
      .finally(() => vigente && setCargando(false))

    return () => { vigente = false }
  }, [liga, temporada, hasta])

  const lider = datos?.tabla?.[0]

  return (
    <section>
      <h2>Tabla de posiciones</h2>
      <p className="resumen">
        Calculada por la base de datos a partir de los resultados (sin sanciones ni
        desempates por enfrentamiento directo).
      </p>

      <div className="filtros">
        <select value={liga} onChange={(e) => setLiga(e.target.value)}>
          {LIGAS.map(([codigo, nombre]) => <option key={codigo} value={codigo}>{nombre}</option>)}
        </select>
        <select value={temporada} onChange={(e) => setTemporada(e.target.value)}>
          {TEMPORADAS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label>
          Tabla a la fecha <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </label>
        <button onClick={() => setHasta('')}>Quitar fecha</button>
      </div>

      {cargando && <p className="resumen">Calculando en el servidor…</p>}
      {error && <p className="aviso error">{error}</p>}

      {lider && (
        <div className="tarjetas">
          <div className="tarjeta-dato">
            <span className="valor">{lider.equipo}</span>
            <span className="etiqueta">Líder · {lider.pts} puntos</span>
          </div>
        </div>
      )}

      {datos && datos.tabla.length === 0 && (
        <p className="aviso">No hay partidos para esa liga, temporada y fecha.</p>
      )}

      {datos && datos.tabla.length > 0 && (
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th className="num">#</th><th>Equipo</th>
                <th className="num">PJ</th><th className="num">G</th>
                <th className="num">E</th><th className="num">P</th>
                <th className="num">GF</th><th className="num">GC</th>
                <th className="num">DG</th><th className="num">Pts</th>
              </tr>
            </thead>
            <tbody>
              {datos.tabla.map((f) => (
                <tr key={f.equipo}>
                  <td className="num">{f.posicion}</td>
                  <td>{f.equipo}</td>
                  <td className="num">{f.pj}</td>
                  <td className="num">{f.pg}</td>
                  <td className="num">{f.pe}</td>
                  <td className="num">{f.pp}</td>
                  <td className="num">{f.gf}</td>
                  <td className="num">{f.gc}</td>
                  <td className="num">{f.dg > 0 ? `+${f.dg}` : f.dg}</td>
                  <td className="num"><strong>{f.pts}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}