import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Crea o actualiza el superusuario a partir de variables de entorno.'

    def handle(self, *args, **opciones):
        usuario = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        clave = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        if not usuario or not clave:
            raise CommandError(
                'Faltan DJANGO_SUPERUSER_USERNAME y DJANGO_SUPERUSER_PASSWORD.'
            )

        User = get_user_model()
        cuenta, creada = User.objects.get_or_create(username=usuario)
        cuenta.is_staff = True
        cuenta.is_superuser = True
        cuenta.set_password(clave)
        cuenta.save()

        self.stdout.write(f'Usuario {usuario}: {"creado" if creada else "actualizado"}.')