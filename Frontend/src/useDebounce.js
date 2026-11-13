import { useEffect, useState } from 'react'

// Devuelve `valor` solo después de que pasen `ms` sin cambios.
export default function useDebounce(valor, ms = 400) {
  const [diferido, setDiferido] = useState(valor)
  useEffect(() => {
    const temporizador = setTimeout(() => setDiferido(valor), ms)
    return () => clearTimeout(temporizador)
  }, [valor, ms])
  return diferido
}