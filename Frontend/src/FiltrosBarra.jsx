import { LIGAS, RESULTADOS, TEMPORADAS } from './constantes'

// Componente "controlado": no guarda nada, recibe los filtros y avisa con onChange.
// Por eso lo pueden compartir Listado y Estadísticas.
export default function FiltrosBarra({ filtros, onChange, onLimpiar }) {
  const cambiar = (campo) => (e) => onChange({ ...filtros, [campo]: e.target.value })

  return (
    <div className="filtros">
      <select value={filtros.liga} onChange={cambiar('liga')}>
        <option value="">Todas las ligas</option>
        {LIGAS.map(([codigo, nombre]) => <option key={codigo} value={codigo}>{nombre}</option>)}
      </select>

      <select value={filtros.temporada} onChange={cambiar('temporada')}>
        <option value="">Todas las temporadas</option>
        {TEMPORADAS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <select value={filtros.resultado} onChange={cambiar('resultado')}>
        <option value="">Cualquier resultado</option>
        {RESULTADOS.map(([codigo, nombre]) => <option key={codigo} value={codigo}>{nombre}</option>)}
      </select>

      <input
        type="text"
        placeholder="Equipo (ej. Barcelona)"
        value={filtros.equipo}
        onChange={cambiar('equipo')}
      />

      <label>
        Desde <input type="date" value={filtros.fecha_desde} onChange={cambiar('fecha_desde')} />
      </label>
      <label>
        Hasta <input type="date" value={filtros.fecha_hasta} onChange={cambiar('fecha_hasta')} />
      </label>

      <button onClick={onLimpiar}>Limpiar filtros</button>
    </div>
  )
}