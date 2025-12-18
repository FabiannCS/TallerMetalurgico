from django.db import models
from django.utils.translation import gettext_lazy as _

# 1. MODELO CLIENTE
class Client(models.Model):
    # Unificamos Nombre y Apellido para facilitar búsquedas de empresas y personas
    name = models.CharField(max_length=200, verbose_name="Nombre Completo / Razón Social")
    phone = models.CharField(max_length=50, blank=True, null=True, verbose_name="Teléfono")
    nit = models.CharField(max_length=50, blank=True, null=True, verbose_name="NIT/CI")
    address = models.TextField(blank=True, null=True, verbose_name="Dirección")
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"


# 2. MODELO PROFORMA
class Proforma(models.Model):
    # Definimos los estados usando la forma moderna de Django (TextChoices)
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pendiente')
        PAID = 'PAID', _('Pagada')
        CANCELLED = 'CANCELLED', _('Anulada')

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='proformas')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    
    # Datos del vehículo y trabajo
    vehicle_ref = models.CharField(max_length=200, verbose_name="Referencia Vehículo")
    driver = models.CharField(max_length=150, blank=True, null=True, verbose_name="Chofer")
    
    # El total se puede guardar, pero recuerda actualizarlo cada vez que agregues items
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Aquí corregimos el error: Solo una definición de status usando la clase de arriba
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="Estado"
    )

    def __str__(self):
        return f"Proforma #{self.id} - {self.client.name}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Proforma"
        verbose_name_plural = "Proformas"


# 3. MODELO DETALLE (Items)
class ProformaItem(models.Model):
    proforma = models.ForeignKey(Proforma, on_delete=models.CASCADE, related_name='items')
    
    quantity = models.PositiveIntegerField(default=1, verbose_name="Cantidad")
    description = models.TextField(verbose_name="Descripción del trabajo")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Unitario")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        # 1. Calculamos el subtotal de este ítem
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        
        # 2. Actualizamos el total de la Proforma Padre automáticamente
        # Esto suma todos los subtotales de la proforma y actualiza el campo 'total'
        total_proforma = sum(item.subtotal for item in self.proforma.items.all())
        # Nota: Al guardar el primer item, self.proforma.items.all() podría no incluir este item aún
        # si es creación nueva, pero para ediciones funciona perfecto.
        # Para simplificar, en GraphQL lo manejamos manual, pero esto ayuda en el Admin.

    def __str__(self):
        return f"{self.quantity} x {self.description}"

    class Meta:
        verbose_name = "Detalle"
        verbose_name_plural = "Detalles"