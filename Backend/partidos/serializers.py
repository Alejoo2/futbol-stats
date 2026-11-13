from rest_framework import serializers

from .fuente_futbol import LIGAS
from .models import Partido


class PartidoSerializer(serializers.ModelSerializer):
    goles_totales = serializers.SerializerMethodField()
    liga_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Partido
        fields = '__all__'
        read_only_fields = ['resultado']

    def get_goles_totales(self, obj):
        return obj.goles_local + obj.goles_visitante

    def get_liga_nombre(self, obj):
        return LIGAS.get(obj.liga, obj.liga)

    def validate(self, datos):
        local = datos.get('equipo_local', getattr(self.instance, 'equipo_local', None))
        visitante = datos.get('equipo_visitante', getattr(self.instance, 'equipo_visitante', None))
        if local and local == visitante:
            raise serializers.ValidationError('Un equipo no puede jugar contra sí mismo.')
        return datos