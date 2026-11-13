import csv 
import io
from datetime import datetime
from decimal import Decimal, InvalidOperation
from urllib.request import Request, urlopen

from .models import Partido

URL_BASE = 'https://www.football-data.co.uk/mmz4281'

LIGAS = {
    'E0': 'Premier League',
    'SP1': 'La Liga',
    'D1': 'Bundesliga',
    'I1': 'Serie A',
    'F1': 'Ligue 1',
}

def codigo_temporada(año_inicio):
    return f'{año_inicio % 100:02d}{(año_inicio + 1) % 100:02d}'

def nombre_temporada(año_inicio):
    return f'{año_inicio}-{(año_inicio + 1) % 100:02d}'

def descargar_csv(liga, año_inicio):
    url = f'{URL_BASE}/{codigo_temporada(año_inicio)}/{liga}.csv'
    solicitud = Request(url, headers={'User-Agent': 'futbol-stats-taller/1.0'})
    with urlopen(solicitud, timeout=60) as respuesta:
        crudo = respuesta.read()

    try:
        texto = crudo.decode('utf-8-sig')
    except UnicodeDecodeError:
        texto = crudo.decode('latin-1')
    return list(csv.DictReader(io.StringIO(texto)))

def _fecha(texto):
    texto = (texto or '').strip()
    for formato in ('%d/%m/%Y', '%d/%m/%y'):
        try:
            return datetime.strptime(texto, formato).date()
        except ValueError:
            continue
    return None

def _entero(valor):
    return int(float(str(valor).strip()))

def _cuota(valor):
    try:
        cuota = Decimal(str(valor).strip()).quantize(Decimal('0.01'))
    except (InvalidOperation, ValueError, TypeError):
        return None
    if not cuota.is_finite() or cuota <= 0 or cuota >= 1000:
        return None
    return cuota

def fila_a_partido(fila, liga, año_inicio):
    fecha = _fecha(fila.get('Date'))
    local = (fila.get('HomeTeam') or '').strip()
    visitante = (fila.get('AwayTeam') or '').strip()
    if fecha is None or not local or not visitante:
        return None

    try:
        goles_local = _entero(fila.get('FTHG'))
        goles_visitante = _entero(fila.get('FTAG'))
    except (TypeError, ValueError):
        return None
    if goles_local < 0 or goles_visitante < 0:
        return None

    if goles_local > goles_visitante:
        resultado = Partido.Resultado.LOCAL
    elif goles_local < goles_visitante:
        resultado = Partido.Resultado.VISITANTE
    else:
        resultado = Partido.Resultado.EMPATE

    return Partido(
        liga=liga,
        temporada=nombre_temporada(año_inicio),
        fecha=fecha,
        equipo_local=local[:80],
        equipo_visitante=visitante[:80],
        goles_local=goles_local,
        goles_visitante=goles_visitante,
        resultado=resultado,
        arbitro=(fila.get('Referee') or '').strip()[:80],
        cuota_local=_cuota(fila.get('B365H')),
    )