from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
from billing.views import generate_pdf

urlpatterns = [
    path('admin/', admin.site.urls),
    # Endpoint de GraphQL (desactivamos CSRF para facilitar el desarrollo con React)
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    # Ruta para el PDF: ejemplo http://localhost:8000/pdf/1/
    path('pdf/<int:proforma_id>/', generate_pdf, name='proforma_pdf'),
]