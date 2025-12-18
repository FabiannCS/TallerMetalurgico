import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, User, Truck, Calculator, Printer, CheckCircle, Search, UserPlus, UserCheck, ArrowLeft } from 'lucide-react';
import { useMutation, useLazyQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';

// --- 1. QUERIES Y MUTATIONS ---

const SEARCH_CLIENTS_QUERY = gql`
  query SearchClients($name: String!) {
    allClients(name: $name) {
      id
      name
      nit
    }
  }
`;

const CREATE_CLIENT_MUTATION = gql`
  mutation CreateClient($name: String!, $phone: String) {
    createClient(name: $name, phone: $phone) {
      client {
        id
        name
        nit
        phone
      }
    }
  }
`;

// Actualizamos para aceptar el campo "driver" (Chofer)
const CREATE_PROFORMA_MUTATION = gql`
  mutation CreateProforma($clientId: ID!, $vehicleRef: String!, $driver: String, $items: [ProformaItemInput]!) {
    createProforma(clientId: $clientId, vehicleRef: $vehicleRef, driver: $driver, items: $items) {
      proforma {
        id
        total
      }
    }
  }
`;

interface ItemRow {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface ClientResult {
  id: string;
  name: string;
  nit: string;
}

export default function CreateProforma() {
  // --- ESTADOS ---
  const [vehicleRef, setVehicleRef] = useState('');
  const [driver, setDriver] = useState(''); // Estado para el chofer
  const [items, setItems] = useState<ItemRow[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [total, setTotal] = useState(0);
  
  // Estados para clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedProformaId, setSavedProformaId] = useState<string | null>(null);

  // --- APOLLO HOOKS ---
  const [createProforma, { loading: loadingProforma }] = useMutation(CREATE_PROFORMA_MUTATION);
  const [createClient, { loading: loadingClient }] = useMutation(CREATE_CLIENT_MUTATION);
  const [searchClients, { data: searchData }] = useLazyQuery(SEARCH_CLIENTS_QUERY);

  // --- EFECTOS ---
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    setTotal(newTotal);
  }, [items]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo buscamos si hay texto y NO hemos seleccionado ya un cliente
      if (searchTerm.length > 0 && !selectedClient) {
        searchClients({ variables: { name: searchTerm } });
        setShowSuggestions(true);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedClient, searchClients]);

  // --- FUNCIONES ---

  const handleAddItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index: number, field: keyof ItemRow, value: string | number) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSelectClient = (client: ClientResult) => {
    setSelectedClient(client);
    setSearchTerm(client.name);
    setShowSuggestions(false);
  };

  // Función mágica para crear cliente rápido
  const handleQuickCreateClient = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!searchTerm) return;

    try {
      const { data } = await createClient({ 
        variables: { 
          name: searchTerm,
          phone: newClientPhone 
        } 
      });

      if (data && data.createClient && data.createClient.client) {
         const newClient = data.createClient.client;
         
         setNewClientPhone(''); 
         setShowSuggestions(false); // Cerramos el menú
         
         // Seleccionamos al cliente
         handleSelectClient(newClient);
         
         // ELIMINAMOS EL ALERT. 
         // El usuario verá visualmente que el cliente ya aparece seleccionado en el input.
         console.log("Cliente creado y seleccionado");
      }
    } catch (error) {
      console.error(error);
      alert("Error al crear el cliente."); // Este alert sí lo dejamos por si falla
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      alert("Por favor selecciona un cliente.");
      return;
    }

    // Validación básica para evitar enviar datos vacíos
    if (!vehicleRef) {
        alert("Por favor ingresa la referencia del vehículo.");
        return;
    }

    try {
      const response = await createProforma({
        variables: {
          clientId: selectedClient.id,
          vehicleRef: vehicleRef,
          driver: driver || "", // Enviar string vacío si no hay chofer
          items: items.map(i => ({
            description: i.description,
            quantity: i.quantity,
            // TRUCO: Enviamos el precio como String para evitar errores decimales
            // Graphene a veces prefiere 'unitPrice' (camelCase) por defecto, 
            // pero asegúrate que coincida con tu schema. 
            // Si falla con unitPrice, intenta cambiarlo aquí a 'unit_price'.
            unitPrice: String(i.unitPrice || "0") 
          }))
        }
      });

      if (response.data) {
          setSavedProformaId(response.data.createProforma.proforma.id);
      }
    } catch (err: any) {
      console.error("Error al guardar:", err);
      // Esto te mostrará el error real en una alerta para que lo leas
      alert(`Error: ${err.message}`);
    }
  };

  const handleReset = () => {
    setSavedProformaId(null);
    setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    setVehicleRef('');
    setDriver('');
    setSearchTerm('');
    setSelectedClient(null);
  };

  // --- VISTA DE ÉXITO ---
  if (savedProformaId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-lg w-full border border-slate-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Guardado Exitoso!</h2>
          <p className="text-slate-500 mb-8">La proforma Nº {savedProformaId.padStart(6, '0')} está lista.</p>
          <div className="space-y-4">
            <a href={`http://127.0.0.1:8000/pdf/${savedProformaId}/`} target="_blank" rel="noreferrer" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              <Printer size={20} /> Imprimir PDF
            </a>
            <button onClick={handleReset} className="block w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all">Crear Nueva Proforma</button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA FORMULARIO ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-8 font-sans text-slate-800 dark:from-slate-900 dark:to-slate-950 dark:bg-gradient-to-br">
        <div className="max-w-5xl mx-auto mb-8 flex items-center gap-4">
          {/* Botón para volver al Inicio */}
          <Link to="/" className="p-3 bg-white rounded-full text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
            <ArrowLeft size={24} />
          </Link>
          
          <div>
             <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg text-white">
                    <FileText size={24} />
                </div>
                Nueva Pro-Forma 
             </h1>
             <p className="text-slate-500 text-sm ml-12 dark:text-slate-400">Metalúrgica Vallegrande</p>
          </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white/80 backdrop-b lur-xl rounded-3xl shadow-2xl border border-white/20 overflow-visible dark:bg-slate-800 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="p-8">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            
            {/* Buscador inteligente de Clientes */}
            <div className="space-y-2 relative z-50">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2"><User size={14} /> Cliente</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar o Registrar Cliente..."
                  className={`w-full border text-lg rounded-xl p-4 pl-12 outline-none transition-all ${selectedClient ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setSelectedClient(null); }}
                  onFocus={() => searchTerm && setShowSuggestions(true)}
                />
                <div className="absolute left-4 top-5 text-slate-400 dark:text-slate-200">
                  {selectedClient ? <UserCheck size={20} className="text-indigo-600 dark:text-indigo-400"/> : <Search size={20}/>}
                </div>
                
                {/* --- INICIO DEL DROPDOWN MEJORADO --- */}
                {showSuggestions && searchTerm && (
                  <div className="absolute z-50 w-full bg-white mt-2 rounded-xl shadow-2xl border border-slate-100 max-h-96 overflow-y-auto">
                    
                    {/* 1. LISTA DE COINCIDENCIAS (Solo si hay) */}
                    {searchData?.allClients?.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Clientes existentes encontrados:
                        </div>
                        {searchData.allClients.map((client: any) => (
                          <div 
                            key={client.id} 
                            onClick={() => handleSelectClient(client)} 
                            className="p-4 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 group transition-colors"
                          >
                            <div className="font-bold text-slate-700 group-hover:text-indigo-700 flex justify-between">
                              {client.name}
                              <span className="text-xs font-normal bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">ID: {client.id}</span>
                            </div>
                            <div className="flex gap-4 text-xs text-slate-400 mt-1">
                               {client.nit && <span>NIT: {client.nit}</span>}
                               {client.phone && <span>Cel: {client.phone}</span>}
                               {!client.nit && !client.phone && <span>Sin datos extra</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 2. SECCIÓN DE REGISTRO (SIEMPRE VISIBLE) */}
                    <div className="p-4 bg-slate-50 border-t-4 border-slate-100">
                        <p className="text-xs font-bold text-indigo-600 mb-2 uppercase flex items-center gap-1">
                           <Plus size={12}/> ¿Es un cliente nuevo?
                        </p>
                        
                        {/* Input Teléfono */}
                        <div className="mb-2 bg-white border border-slate-300 rounded-lg flex items-center px-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                           <span className="text-slate-400 text-xs mr-2 font-bold">Cel:</span>
                           <input 
                              type="text" 
                              placeholder="Teléfono del nuevo cliente..."
                              className="w-full py-2 outline-none text-sm text-slate-700 placeholder:text-slate-300"
                              value={newClientPhone}
                              onChange={(e) => setNewClientPhone(e.target.value)}
                              onClick={(e) => e.stopPropagation()} 
                           />
                        </div>

                        {/* Botón Guardar Nuevo */}
                        <div 
                          onClick={handleQuickCreateClient}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-md active:scale-95"
                        >
                          {loadingClient ? (
                              <span>Guardando...</span>
                          ) : (
                              <>
                                <UserPlus size={16} /> 
                                {/* Usamos span para evitar traducciones automáticas erróneas */}
                                <span>Registrar nuevo "{searchTerm}"</span>
                              </>
                          )}
                        </div>
                    </div>
                  </div>
                )}
                {/* --- FIN DEL DROPDOWN MEJORADO --- */}
              </div>
            </div>

            {/* Vehículo y Chofer */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Truck size={14} /> Vehículo</label>
                <input type="text" placeholder="Ej: Camión Tracto 593-EXB" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={vehicleRef} onChange={(e) => setVehicleRef(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><User size={14} /> Chofer</label>
                <input type="text" placeholder="Nombre del conductor (Opcional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={driver} onChange={(e) => setDriver(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full mb-8"></div>

          {/* TABLA DE ÍTEMS */}
          <div className="mb-8 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-4 p-4 bg-slate-100 border-b border-slate-200 text-sm font-semibold text-slate-600">
                <div className="col-span-1 text-center">Cant.</div>
                <div className="col-span-7">Descripción</div>
                <div className="col-span-2 text-right">Precio Unitario</div>
                <div className="col-span-2 text-center">Acción</div>
              </div>
              <div className="divide-y divide-slate-200">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-white transition-colors">
                    <div className="col-span-1"><input type="number" min="1" className="w-full text-center bg-white border border-slate-200 rounded-lg py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} /></div>
                    <div className="col-span-7"><input type="text" placeholder="Descripción..." className="w-full bg-transparent border-0 border-b border-transparent focus:border-indigo-400 focus:ring-0 text-slate-700" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} /></div>
                    <div className="col-span-2"><input type="number" className="w-full text-right bg-white border border-slate-200 rounded-lg py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-2 flex justify-center"><button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button></div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleAddItem} className="w-full py-3 hover:bg-slate-100 text-slate-500 font-medium text-sm flex items-center justify-center gap-2 transition-all"><Plus size={16} /> Agregar línea</button>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col md:flex-row justify-end items-end gap-8">
            <div className="w-full md:w-80">
                <div className="flex justify-between items-center mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="text-indigo-800 font-bold text-lg flex items-center gap-2"><Calculator size={20}/> Total</span>
                    <span className="text-3xl font-black text-indigo-600 tracking-tight">{total.toFixed(2)} <span className="text-sm">Bs</span></span>
                </div>
                <button type="submit" disabled={loadingProforma} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                    {loadingProforma ? 'Guardando...' : <><Save size={20} /> Guardar Pro-Forma</>}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}