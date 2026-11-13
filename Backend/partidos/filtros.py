"""Filtros compartidos por el listado y por las estadísticas."""

from django.db.models import Q
from django.utils.dateparse import parse_date
from rest_framework.exceptions import ValidationError


def _fecha(valor, nombre):
    try:
        fecha = parse_date(valor)
    except ValueError:
        fecha = None
    if fecha is None:
        raise ValidationError({nombre: 'Usa el formato AAAA-MM-DD.'})
    return fecha


def filtrar_partidos(queryset, params):
    """Aplica los filtros de la URL (?liga=&temporada=&equipo=...) en SQL."""
    if params.get('liga'):
        queryset = queryset.filter(liga=params['liga'])
    if params.get('temporada'):
        queryset = queryset.filter(temporada=params['temporada'])
    if params.get('resultado'):
        queryset = queryset.filter(resultado=params['resultado'])
    if params.get('equipo'):
        equipo = params['equipo']
        queryset = queryset.filter(
            Q(equipo_local__iexact=equipo) | Q(equipo_visitante__iexact=equipo)
        )
    if params.get('fecha_desde'):
        queryset = queryset.filter(fecha__gte=_fecha(params['fecha_desde'], 'fecha_desde'))
    if params.get('fecha_hasta'):
        queryset = queryset.filter(fecha__lte=_fecha(params['fecha_hasta'], 'fecha_hasta'))
    return queryset