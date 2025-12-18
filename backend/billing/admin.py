from django.contrib import admin
from .models import Client, Proforma, ProformaItem

class ItemInline(admin.TabularInline):
    model = ProformaItem
    extra = 1

@admin.register(Proforma)
class ProformaAdmin(admin.ModelAdmin):
    inlines = [ItemInline] # Esto permite editar los ítems DENTRO de la proforma
    list_display = ('id', 'client', 'vehicle_ref', 'created_at', 'total')

admin.site.register(Client)