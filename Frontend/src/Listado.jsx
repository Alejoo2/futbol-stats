import { useEffect, useState } from 'react'
import { construirQuery, pedir } from './api'
import { ETIQUETA_RESULTADO, FILTROS_VACIOS } from './constantes'
import FiltrosBarra from './FiltrosBarra'
import useDebounce from './useDebounce'

const ORDENES = [
  ['-fecha', 'Más recientes'],
  ['fecha', 'Más antiguos'],
  ['-goles_totales', 'Más goles'],
  ['goles_totales', 'Menos goles'],
]
const TAMANOS = [25, 50, 100]

export default function Listado() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('-fecha')
  const [pagina, setPagina] = useState(1)
  const [tamano, setTamano] = useState(50)

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Los textos esperan 400 ms; los selects también pasan por aquí por simplicidad.
  const filtrosDiferidos = useDebounce(filtros)
  const busquedaDiferida = useDebounce(busqueda)

  // Cada vez que cambia un criterio se vuelve a la página 1
  // (si no, podrías quedar en la página 9 de un resultado de 2 páginas).
  const cambiarFiltros = (nuevos) => { setFiltros(nuevos); setPagina(1) }
  const cambiarBusqueda = (texto) => { setBusqueda(texto); setPagina(1) }

  useEffect(() => {
    let vigente = true  // evita que una respuesta lenta pise a una más nueva
    setCargando(true)
    setError('')

    const query = construirQuery({
      ...filtrosDiferidos,
      search: busquedaDiferida,
      ordering: orden,
      page: pagina,
      page_size: tamano,
    })

    pedir(`/partidos/${query}`)
      .then(({ ok, datos }) => {
        if (!vigente) return
        if (ok) setDatos(datos)
        else setError(`El servidor respondió con error: ${JSON.stringify(datos)}`)
      })
      .catch(() => vigente && setError('No se pudo conectar con el servidor.'))
      .finally(() => vigente && setCargando(false))

    return () => { vigente = false }
  }, [filtrosDiferidos, busquedaDiferida, orden, pagina, tamano])

  const totalPaginas = datos ? Math.max(1, Math.ceil(datos.count / tamano)) : 1

  return (
    <section>
      <h2>Partidos</h2>

      <FiltrosBarra
        filtros={filtros}
        onChange={cambiarFiltros}
        onLimpiar={() => { setFiltros(FILTROS_VACIOS); setBusqueda(''); setPagina(1) }}
      />

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar equipo o árbitro…"
          value={busqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
        />
        <select value={orden} onChange={(e) => { setOrden(e.target.value); setPagina(1) }}>
          {ORDENES.map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
        </select>
        <select value={tamano} onChange={(e) => { setTamano(Number(e.target.value)); setPagina(1) }}>
          {TAMANOS.map((n) => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </div>

      {error && <p className="aviso error">{error}</p>}
      <p className="resumen">
        {cargando ? 'Cargando…' : datos ? `${datos.count.toLocaleString('es-CO')} partidos encontrados` : ''}
      </p>

      {datos && (
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha</th><th>Liga</th><th>Temporada</th>
                <th>Local</th><th className="num">Marcador</th><th>Visitante</th>
                <th>Resultado</th><th className="num">Goles</th>
              </tr>
            </thead>
            <tbody>
              {datos.results.map((p) => (
                <tr key={p.id}>
                  <td>{p.fecha}</td>
                  <td>{p.liga_nombre}</td>
                  <td>{p.temporada}</td>
                  <td>{p.equipo_local}</td>
                  <td className="num"><strong>{p.goles_local} - {p.goles_visitante}</strong></td>
                  <td>{p.equipo_visitante}</td>
                  <td>{ETIQUETA_RESULTADO[p.resultado]}</td>
                  <td className="num">{p.goles_totales}</td>
                </tr>
              ))}
              {datos.results.length === 0 && (
                <tr><td colSpan="8" className="vacio">Ningún partido coincide con los filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="paginacion">
        <button disabled={!datos?.previous} onClick={() => setPagina(pagina - 1)}>← Anterior</button>
        <span>Página {pagina} de {totalPaginas}</span>
        <button disabled={!datos?.next} onClick={() => setPagina(pagina + 1)}>Siguiente →</button>
      </div>
    </section>
  )
}