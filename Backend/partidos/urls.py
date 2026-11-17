from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (DepurarView, EstadisticasView, LlaveView,
                    PartidoViewSet, SincronizarView, TablaPosicionesView)

router = DefaultRouter()
router.register('partidos', PartidoViewSet, basename='partido')

urlpatterns = [
    path('auth/login/', LlaveView.as_view(), name='login'),
    path('sincronizar/', SincronizarView.as_view(), name='sincronizar'),
    path('depurar/', DepurarView.as_view(), name='depurar'),
    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
    path('posiciones/', TablaPosicionesView.as_view(), name='posiciones'),
    *router.urls,
]