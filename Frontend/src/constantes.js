// Datos fijos que usan varios componentes. Deben coincidir con el backend.
export const LIGAS = [
  ['E0', 'Premier League'],
  ['SP1', 'La Liga'],
  ['D1', 'Bundesliga'],
  ['I1', 'Serie A'],
  ['F1', 'Ligue 1'],
]

// 2026-27, 2025-26 ... 2016-17 (el mismo formato que guarda el backend).
export const TEMPORADAS = Array.from({ length: 11 }, (_, i) => {
  const anio = 2026 - i
  return `${anio}-${String((anio + 1) % 100).padStart(2, '0')}`
})

export const RESULTADOS = [
  ['H', 'Gana local'],
  ['D', 'Empate'],
  ['A', 'Gana visitante'],
]

export const ETIQUETA_RESULTADO = Object.fromEntries(RESULTADOS)

export const FILTROS_VACIOS = {
  liga: '', temporada: '', resultado: '', equipo: '', fecha_desde: '', fecha_hasta: '',
}