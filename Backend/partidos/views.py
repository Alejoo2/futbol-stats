from django.contrib.auth import authenticate
from django.db.models import Avg, Count, F, FloatField, Max, Min, Q, Sum
from rest_framework import filters, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.permissions import (AllowAny, IsAuthenticated,
                                        IsAuthenticatedOrReadOnly)
from rest_framework.response import Response
from rest_framework.views import APIView

from .filtros import filtrar_partidos
from .fuente_futbol import LIGAS
from .models import Partido
from .serializers import PartidoSerializer
from .servicios import cargar_partidos


class PartidoViewSet(viewsets.ModelViewSet):
    """Lista, detalle, crear, editar y borrar partidos."""

    serializer_class = PartidoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['equipo_local', 'equipo_visitante', 'arbitro']
    ordering_fields = ['fecha', 'goles_local', 'goles_visitante', 'goles_totales', 'cuota_local']

    def get_queryset(self):
        queryset = Partido.objects.annotate(
            goles_totales=F('goles_local') + F('goles_visitante'),
        )
        return filtrar_partidos(queryset, self.request.query_params)


def _r(valor):
    """Redondea promedios para mostrarlos; conserva None si no hay datos."""
    return None if valor is None else round(valor, 2)


class EstadisticasView(APIView):
    """GET /api/estadisticas/ — agregaciones calculadas por PostgreSQL."""

    def get(self, request):
        partidos = filtrar_partidos(Partido.objects.all(), request.query_params)

        goles = F('goles_local') + F('goles_visitante')
        promedio = Avg(goles, output_field=FloatField())

        resumen = partidos.aggregate(
            total_partidos=Count('id'),
            suma_goles=Sum(goles),
            promedio_goles=promedio,
            maximo_goles=Max(goles),
            minimo_goles=Min(goles),
            victorias_local=Count('id', filter=Q(resultado='H')),
            empates=Count('id', filter=Q(resultado='D')),
            victorias_visitante=Count('id', filter=Q(resultado='A')),
        )
        resumen['promedio_goles'] = _r(resumen['promedio_goles'])

        por_liga_temporada = [
            {
                'liga': fila['liga'],
                'liga_nombre': LIGAS.get(fila['liga'], fila['liga']),
                'temporada': fila['temporada'],
                'partidos': fila['partidos'],
                'suma_goles': fila['suma_goles'],
                'promedio_goles': _r(fila['promedio_goles']),
                'maximo_goles': fila['maximo_goles'],
                'victorias_local': fila['victorias_local'],
            }
            for fila in (
                partidos.values('liga', 'temporada')
                .annotate(
                    partidos=Count('id'),
                    suma_goles=Sum(goles),
                    promedio_goles=promedio,
                    maximo_goles=Max(goles),
                    victorias_local=Count('id', filter=Q(resultado='H')),
                )
                .order_by('liga', 'temporada')
            )
        ]

        por_resultado = list(
            partidos.values('resultado')
            .annotate(partidos=Count('id'))
            .order_by('resultado')
        )

        distribucion_goles = list(
            partidos.annotate(total=goles)
            .values('total')
            .annotate(partidos=Count('id'))
            .order_by('total')
        )

        return Response({
            'resumen': resumen,
            'por_liga_temporada': por_liga_temporada,
            'por_resultado': por_resultado,
            'distribucion_goles': distribucion_goles,
        })


class LlaveView(APIView):
    """POST /api/auth/login/ — entrega el token a quien traiga credenciales válidas."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        usuario = authenticate(
            username=request.data.get('username'),
            password=request.data.get('password'),
        )
        if usuario is None:
            return Response(
                {'detalle': 'Credenciales inválidas.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        llave, _ = Token.objects.get_or_create(user=usuario)
        return Response({'token': llave.key, 'usuario': usuario.username})


class SincronizarView(APIView):
    """POST /api/sincronizar/ — carga una liga y una temporada. Requiere token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        liga = request.data.get('liga')
        try:
            anio = int(request.data.get('anio'))
        except (TypeError, ValueError):
            anio = None

        if liga not in LIGAS or anio is None or not 2000 <= anio <= 2030:
            return Response(
                {'detalle': 'Envía liga (E0, SP1, D1, I1, F1) y anio entre 2000 y 2030.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(cargar_partidos([liga], anio, anio))


FILTROS_DEPURAR = ('liga', 'temporada', 'equipo', 'resultado', 'fecha_desde', 'fecha_hasta')


class DepurarView(APIView):
    """DELETE /api/depurar/?liga=...&temporada=... — borra solo el subconjunto filtrado."""

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        filtros = {k: v for k, v in request.query_params.items() if k in FILTROS_DEPURAR}
        if not filtros:
            return Response(
                {'detalle': 'Indica al menos un filtro; esta ruta no vacía la tabla completa.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if request.data.get('confirmar') is not True:
            return Response(
                {'detalle': 'El cuerpo debe traer {"confirmar": true}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        eliminados, _ = filtrar_partidos(Partido.objects.all(), filtros).delete()
        return Response({'eliminados': eliminados, 'filtros': filtros})