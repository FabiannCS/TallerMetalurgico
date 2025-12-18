from django.http import HttpResponse
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from weasyprint import HTML
from .models import Proforma
from num2words import num2words

# Función auxiliar para formatear como se usa en Bolivia
def number_to_literal(number):
    try:
        # Separamos enteros y decimales
        entero = int(number)
        decimal = int(round((number - entero) * 100))
        
        # Convertimos el entero a letras en español
        letras = num2words(entero, lang='es').upper()
        
        # Formato final: "CIENTO NOVENTA Y SIETE 00/100 BOLIVIANOS"
        return f"{letras} {decimal:02d}/100 BOLIVIANOS"
    except:
        return ""

def generate_pdf(request, proforma_id):
    # 1. Buscar la proforma
    proforma = get_object_or_404(Proforma, pk=proforma_id)
    
    # 2. Calcular el monto literal
    literal_amount = number_to_literal(proforma.total)
    
    # 3. Renderizar el HTML pasando el dato extra 'literal_amount'
    html_string = render_to_string('billing/invoice.html', {
        'proforma': proforma,
        'literal_amount': literal_amount # <--- Lo enviamos a la plantilla
    })
    
    # 4. Generar PDF
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
    
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="proforma_{proforma.id}.pdf"'
    return response