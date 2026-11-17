// Datos del proyecto: se muestran en "Acerca del proyecto" y en el pie de página.
export const PROYECTO = {
  autor: 'Cristian Alejandro Alvarez Cruz',
  documento: '1057980593',
  taller: 'Taller Django + React · Proyecto final',
  dominio: 'Fútbol: partidos de las 5 grandes ligas europeas (2016 a 2026)',
  fuente: { nombre: 'football-data.co.uk', url: 'https://www.football-data.co.uk' },
  tecnologias: [
    'Django', 'Django REST Framework', 'PostgreSQL',
    'React', 'Vite', 'Recharts', 'WhiteNoise + Gunicorn', 'Render',
  ],
  herramientaExtra: {
    nombre: 'Tabla de posiciones calculada en la base de datos',
    descripcion:
      'Genera la clasificación completa de una liga y temporada: partidos jugados, ' +
      'ganados, empatados y perdidos, goles a favor y en contra, diferencia de goles y ' +
      'puntos. Los puntos se suman dentro de PostgreSQL con agregaciones condicionales ' +
      '(Sum, Case/When y Count con filtro), agrupando por equipo en cada lado del partido ' +
      '(local y visitante). También permite ver cómo estaba la tabla en una fecha concreta. ' +
      'Esta herramienta no hace parte de lo visto en el taller.',
    puntos: [
      'Ruta de la API: GET /api/posiciones/?liga=E0&temporada=2023-24&fecha_hasta=2024-01-31',
      'Cada partido cuenta para dos equipos, por eso hay una consulta agrupada por local y otra por visitante.',
      'Límite del cálculo: usa solo los resultados, sin sanciones de puntos ni desempates por enfrentamiento directo.',
    ],
  },
}