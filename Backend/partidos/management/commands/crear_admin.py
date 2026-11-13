import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Crea o actualiza el superusuario a partir de variables de entorno.'

    def handle(self, *args, **opciones):
        usuario = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        clave = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not usuario or not clave:
            # Solo muestra NOMBRES (nunca valores) para encontrar el desajuste.
            parecidas = sorted(
                repr(nombre) for nombre in os.environ
                if 'SUPER' in nombre.upper() or 'DJANGO' in nombre.upper()
            )
            raise CommandError(
                'Faltan DJANGO_SUPERUSER_USERNAME y/o DJANGO_SUPERUSER_PASSWORD. '
                f'Variables parecidas que SÍ llegan: {parecidas}'
            )

        User = get_user_model()
        cuenta, creada = User.objects.get_or_create(username=usuario)
        cuenta.is_staff = True
        cuenta.is_superuser = True
        cuenta.set_password(clave)
        cuenta.save()

        self.stdout.write(f'Usuario {usuario}: {"creado" if creada else "actualizado"}.')