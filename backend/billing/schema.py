import graphene
from graphene_django import DjangoObjectType
from .models import Client, Proforma, ProformaItem
import decimal
from django.db.models import Q

# 1. DEFINICIÓN DE TIPOS (Cómo se ven los datos hacia afuera)

class ClientType(DjangoObjectType):
    class Meta:
        model = Client
        fields = "__all__"

class ProformaItemType(DjangoObjectType):
    class Meta:
        model = ProformaItem
        fields = "__all__"
    
    # Forzamos que el precio vaya como texto para evitar líos de decimales en JS
    unit_price = graphene.String()
    subtotal = graphene.String()

class ProformaType(DjangoObjectType):
    class Meta:
        model = Proforma
        fields = "__all__"
    
    # Mapeamos los campos para que React los entienda (CamelCase vs Snake_case)
    id = graphene.ID(source='pk')
    vehicleRef = graphene.String(source='vehicle_ref') # Mapea vehicle_ref -> vehicleRef
    createdAt = graphene.String()
    total = graphene.String()
    status = graphene.String() # Ahora sí existe en el modelo
    item_count = graphene.Int()

    def resolve_createdAt(self, info):
        # Devolvemos la fecha formateada bonita (Ej: 17/12/2025)
        return self.created_at.strftime("%d/%m/%Y")

    def resolve_item_count(self, info):
        return self.items.count()

# 2. DEFINICIÓN DE INPUTS (Para guardar datos)

class ProformaItemInput(graphene.InputObjectType):
    description = graphene.String(required=True)
    quantity = graphene.Int(required=True)
    unit_price = graphene.String(required=True) # Recibimos string

# 3. MUTACIONES (Crear cosas)

class CreateClient(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        phone = graphene.String()
        nit = graphene.String()

    client = graphene.Field(ClientType)

    def mutate(self, info, name, phone=None, nit=None):
        client = Client(name=name, phone=phone, nit=nit)
        client.save()
        return CreateClient(client=client)

class CreateProforma(graphene.Mutation):
    class Arguments:
        client_id = graphene.ID(required=True)
        vehicle_ref = graphene.String(required=True)
        driver = graphene.String()
        items = graphene.List(ProformaItemInput, required=True)

    proforma = graphene.Field(ProformaType)

    def mutate(self, info, client_id, vehicle_ref, items, driver=None):
        client = Client.objects.get(pk=client_id)
        
        # Crear la cabecera
        new_proforma = Proforma(
            client=client,
            vehicle_ref=vehicle_ref,
            driver=driver
        )
        new_proforma.save()

        # Crear los items
        total_acumulado = 0
        for item_data in items:
            # Convertimos el precio string a decimal matemático
            precio_decimal = decimal.Decimal(item_data.unit_price)
            
            item = ProformaItem(
                proforma=new_proforma,
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=precio_decimal
            )
            item.save()
            total_acumulado += (item.quantity * precio_decimal)
        
        # Actualizamos el total de la proforma
        new_proforma.total = total_acumulado
        new_proforma.save()

        return CreateProforma(proforma=new_proforma)


class UpdateProformaStatus(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        status = graphene.String(required=True)

    proforma = graphene.Field(ProformaType)

    def mutate(self, info, id, status):
        try:
            proforma = Proforma.objects.get(pk=id)
            proforma.status = status
            proforma.save()
            return UpdateProformaStatus(proforma=proforma)
        except Proforma.DoesNotExist:
            raise Exception("Proforma no encontrada")

# 4. QUERY PRINCIPAL (Búsquedas)

class Query(graphene.ObjectType):
    all_clients = graphene.List(ClientType, name=graphene.String(required=False))
    all_proformas = graphene.List(ProformaType, search=graphene.String(required=False))
    proforma = graphene.Field(ProformaType, id=graphene.ID(required=True))

    def resolve_all_clients(self, info, name=None):
        if name:
            return Client.objects.filter(name__icontains=name)
        return Client.objects.all()

    def resolve_all_proformas(self, info, search=None):
        qs = Proforma.objects.all().order_by('-created_at')
        if search:
            # Buscamos por nombre de cliente O referencia de vehículo
            qs = qs.filter(
                Q(client__name__icontains=search) | 
                Q(vehicle_ref__icontains=search)
            )
        return qs

    def resolve_proforma(self, info, id):
        return Proforma.objects.get(pk=id)

class Mutation(graphene.ObjectType):
    create_client = CreateClient.Field()
    create_proforma = CreateProforma.Field()
    update_proforma_status = UpdateProformaStatus.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)