from django.db import models

class Partido(models.Model):
    class Resultado(models.TextChoices):
        LOCAL = 'H', 'Gana local'
        EMPATE = 'D', 'Empate'
        VISITANTE = 'A', 'Gana Visitante'

    liga = models.CharField(max_length=3, db_index=True)
    temporada = models.CharField(max_length=7, db_index=True)
    fecha = models.DateField(db_index=True)
    equipo_local = models.CharField(max_length=80, db_index=True)
    equipo_visitante = models.CharField(max_length=80, db_index=True)
    goles_local = models.PositiveSmallIntegerField()
    goles_visitante = models.PositiveSmallIntegerField()
    resultado = models.CharField(max_length=1, choices=Resultado.choices)
    arbitro = models.CharField(max_length=80, blank=True)
    cuota_local=models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ['-fecha', 'id']
        constraints = [
            models.UniqueConstraint(
                fields=['liga', 'fecha', 'equipo_local', 'equipo_visitante'],
                name='partido_unico',
            ),
        ]

    def __str__(self):
        return f'{self.equipo_local} {self.goles_local}-{self.goles_visitante} {self.equipo_visitante}'

    def save(self, *args, **kwargs):
        if self.goles_local > self.goles_visitante:
            self.resultado = self.Resultado.LOCAL
        elif self.goles_local < self.goles_visitante:
            self.resultado = self.Resultado.VISITANTE
        else:
            self.resultado = self.Resultado.EMPATE
        super().save(*args, **kwargs)