from django.core.management.base import BaseCommand, CommandError

from partidos.fuente_futbol import LIGAS
from partidos.servicios import cargar_partidos

class Command(BaseCommand):
    help = 'Descarga partidos reales de football-data.co.uk y los guarda con bulk_create.'

    def add_arguments(self, parser):
        parser.add_argument('--ligas', nargs='+', choices=list(LIGAS), default=list(LIGAS))
        parser.add_argument('--desde', type=int, default=2016, help='Año en que empieza la primera temporada.')
        parser.add_argument('--hasta', type=int, default=2026, help='Año en que empieza la ultima temporada.')

    def handle(self, *args, **opciones):
        if opciones['desde'] > opciones['hasta']:
            raise CommandError('--desde no puede ser mayor que --hasta')

        informe = cargar_partidos(opciones['ligas'], opciones['desde'], opciones['hasta'])

        self.stdout.write(f'Filas recibidas: {informe["recibidos"]:,}')
        self.stdout.write(f'Filas invalidas descartadas: {informe["invalidos"]:,}')
        self.stdout.write(f'Partidos nuevos guardados: {informe["creados"]:,}')
        self.stdout.write(f'Total en la base: {informe["total"]:,}')
        self.stdout.write(f'Tiempo: {informe["ms"] / 100: .1f} s')
        for aviso in informe['archivos_omitidos']:
            self.stdout.write(self.style.WARNING(f'Omitido: {aviso}'))
        