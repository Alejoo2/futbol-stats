from django.contrib import admin
from .models import Partido

@admin.register(Partido)
class PartidoAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'liga', 'temporada', 'equipo_local',
                    'goles_local', 'goles_visitante', 'equipo_visitante', 'resultado')
    search_fields = ('equipo_local', 'equipo_visitante', 'arbitro')
    list_filter = ('liga', 'temporada', 'resultado')
    date_hierarchy = 'fecha'
    readonly_fields = ('resultado',)
