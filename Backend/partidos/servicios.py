import time
from urllib.error import URLError

from .fuente_futbol import descargar_csv, fila_a_partido, nombre_temporada
from .models import Partido

def cargar_partidos(ligas, desde, hasta):
    inicio = time.perf_counter()

    existentes = set(
        Partido.objects.values_list(
            'liga', 'fecha', 'equipo_local', 'equipo_visitante',
        )
    )

    nuevos = []
    recibidos = 0
    invalidos = 0
    archivos_omitidos = []

    for liga in ligas:
        for año in range(desde, hasta +1):
            try:
                filas = descargar_csv(liga, año)
            except (URLError, TimeoutError) as error:
                archivos_omitidos.append(f'{liga} {nombre_temporada(año)}: {error}')
                continue

            for fila in filas:
                recibidos += 1
                partido = fila_a_partido(fila, liga, año)
                if partido is None:
                    invalidos += 1
                    continue

                clave = (partido.liga, partido.fecha, partido.equipo_local, partido.equipo_visitante)
                if clave in existentes:
                    continue
                existentes. add(clave)
                nuevos.append(partido)

        total_antes = Partido.objects.count()
        if nuevos:
            Partido.objects.bulk_create(nuevos, batch_size=1000, ignore_conflicts=True)
        total_despues = Partido.objects.count()

        return {
            'recibidos': recibidos,
            'invalidos': invalidos,
            'creados': total_despues - total_antes,
            'total': total_despues,
            'archivos_omitidos': archivos_omitidos,
            'ms': round((time.perf_counter() - inicio) * 1000),
        }