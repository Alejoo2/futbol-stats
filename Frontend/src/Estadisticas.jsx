import { useEffect, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { construirQuery, pedir } from './api'
import { ETIQUETA_RESULTADO, FILTROS_VACIOS } from './constantes'
import FiltrosBarra from './FiltrosBarra'
import useDebounce from './useDebounce'

const COLORES = ['#0f7a3d', '#1d6fd8', '#d9822b', '#b3261e', '#7a4bc7']

const pct = (parte, total) => (total ? `${((parte / total) * 100).toFixed(1)}%` : '—')

export default function Estadisticas() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const filtrosDiferidos = useDebounce(filtros)

  useEffect(() => {
    let vigente = true
    setCargando(true)
    setError('')

    pedir(`/estadisticas/${construirQuery(filtrosDiferidos)}`)
      .then(({ ok, datos }) => {
        if (!vigente) return
        if (ok) setDatos(datos)
        else setError(`El servidor respondió con error: ${JSON.stringify(datos)}`)
      })
      .catch(() => vigente && setError('No se pudo conectar con el servidor.'))
      .finally(() => vigente && setCargando(false))

    return () => { vigente = false }
  }, [filtrosDiferidos])

  const r = datos?.resumen

  // La API entrega una fila por (liga, temporada). Para dibujar una línea por liga
  // hay que "pivotar": una fila por temporada con una columna por liga.
  const filas = datos?.por_liga_temporada ?? []
  const ligas = [...new Set(filas.map((f) => f.liga_nombre))]
  const serie = [...new Set(filas.map((f) => f.temporada))].sort().map((temporada) => {
    const punto = { temporada }
    filas.filter((f) => f.temporada === temporada)
      .forEach((f) => { punto[f.liga_nombre] = f.promedio_goles })
    return punto
  })

  const porResultado = (datos?.por_resultado ?? []).map((f) => ({
    nombre: ETIQUETA_RESULTADO[f.resultado], partidos: f.partidos,
  }))

  return (
    <section>
      <h2>Estadísticas</h2>
      <p className="resumen">
        Calculadas por la base de datos y recalculadas con los filtros que elijas.
      </p>

      <FiltrosBarra
        filtros={filtros}
        onChange={setFiltros}
        onLimpiar={() => setFiltros(FILTROS_VACIOS)}
      />

      {cargando && <p className="resumen">Calculando…</p>}
      {error && <p className="aviso error">{error}</p>}

      {r && (
        <div className="tarjetas">
          <div className="tarjeta-dato">
            <span className="valor">{r.total_partidos.toLocaleString('es-CO')}</span>
            <span className="etiqueta">Partidos</span>
          </div>
          <div className="tarjeta-dato">
            <span className="valor">{r.promedio_goles ?? '—'}</span>
            <span className="etiqueta">Goles por partido</span>
          </div>
          <div className="tarjeta-dato">
            <span className="valor">{r.maximo_goles ?? '—'}</span>
            <span className="etiqueta">Máximo de goles en un partido</span>
          </div>
          <div className="tarjeta-dato">
            <span className="valor">{pct(r.victorias_local, r.total_partidos)}</span>
            <span className="etiqueta">Victorias locales</span>
          </div>
          <div className="tarjeta-dato">
            <span className="valor">{pct(r.empates, r.total_partidos)}</span>
            <span className="etiqueta">Empates</span>
          </div>
        </div>
      )}

      {r && r.total_partidos === 0 && (
        <p className="aviso">Ningún partido coincide con esos filtros.</p>
      )}

      {serie.length > 0 && (
        <div className="panel">
          <h3>Promedio de goles por temporada y liga</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={serie}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="temporada" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              {ligas.map((liga, i) => (
                <Line
                  key={liga}
                  type="monotone"
                  dataKey={liga}
                  stroke={COLORES[i % COLORES.length]}
                  strokeWidth={2}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rejilla-graficas">
        {porResultado.length > 0 && (
          <div className="panel">
            <h3>Resultados</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={porResultado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="partidos" fill="#0f7a3d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {(datos?.distribucion_goles?.length ?? 0) > 0 && (
          <div className="panel">
            <h3>Partidos según goles totales</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={datos.distribucion_goles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="total" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="partidos" fill="#1d6fd8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {filas.length > 0 && (
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Liga</th><th>Temporada</th>
                <th className="num">Partidos</th><th className="num">Goles</th>
                <th className="num">Promedio</th><th className="num">Máx.</th>
                <th className="num">Victorias local</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={`${f.liga}-${f.temporada}`}>
                  <td>{f.liga_nombre}</td>
                  <td>{f.temporada}</td>
                  <td className="num">{f.partidos}</td>
                  <td className="num">{f.suma_goles}</td>
                  <td className="num">{f.promedio_goles}</td>
                  <td className="num">{f.maximo_goles}</td>
                  <td className="num">{f.victorias_local}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}