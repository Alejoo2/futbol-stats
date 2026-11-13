// En desarrollo apunta a Django local; en producción .env.production pone VITE_API_URL=/api
const BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

// { liga: 'E0', equipo: '' } -> '?liga=E0'  (omite los vacíos)
export function construirQuery(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor !== '' && valor !== null && valor !== undefined) q.set(clave, valor)
  })
  const texto = q.toString()
  return texto ? `?${texto}` : ''
}

// Devuelve siempre { ok, status, datos }. Así los componentes revisan `ok`
// y no tienen que repetir try/catch ni leer el JSON a mano.
export async function pedir(ruta, { metodo = 'GET', cuerpo, token } = {}) {
  const headers = {}
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Token ${token}`

  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers,
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
  })

  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    // respuesta sin cuerpo (por ejemplo un 204)
  }
  return { ok: respuesta.ok, status: respuesta.status, datos }
}