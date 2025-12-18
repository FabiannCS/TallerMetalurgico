import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client'; // Importamos useMutation
import { Search, FileText, ArrowLeft, CheckCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const GET_PROFORMAS = gql`
  query GetProformas($search: String) {
    allProformas(search: $search) {
      id
      createdAt
      vehicleRef
      total
      status
      client {
        name
        phone
      }
    }
  }
`;

// 1. DEFINIMOS LA MUTACIÓN
const MARK_AS_PAID = gql`
  mutation MarkAsPaid($id: ID!, $status: String!) {
    updateProformaStatus(id: $id, status: $status) {
      proforma {
        id
        status
      }
    }
  }
`;

export default function ProformaHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PAID'>('PENDING');

  const { data, loading, error, refetch } = useQuery(GET_PROFORMAS, {
    variables: { search: searchTerm },
    notifyOnNetworkStatusChange: true,
  });

  // 2. HOOK PARA EJECUTAR EL COBRO
  const [markAsPaid] = useMutation(MARK_AS_PAID, {
    onCompleted: () => {
        alert("¡Cobro registrado correctamente!");
        refetch(); // Recargamos la lista automáticamente
    },
    onError: (err) => alert("Error al cobrar: " + err.message)
  });

  const handleCobrar = (id: string) => {
      if (window.confirm("¿Confirmas que recibiste el pago de esta proforma?")) {
          markAsPaid({ variables: { id: id, status: 'PAID' } });
      }
  };

  const filteredProformas = data?.allProformas.filter((p: any) => p.status === activeTab) || [];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans transition-colors duration-300 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-3 bg-white dark:bg-slate-800 rounded-full text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <ArrowLeft size={24} />
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Historial</h1>
                <p className="text-slate-500 dark:text-slate-400">Administra tus cobros y trabajos</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          </div>
        </div>

        {/* PESTAÑAS */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700 pb-1">
            <button 
                onClick={() => setActiveTab('PENDING')}
                className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${activeTab === 'PENDING' ? 'bg-white dark:bg-slate-800 border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <Clock size={18}/> PENDIENTES
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">
                    {data?.allProformas.filter((p:any) => p.status === 'PENDING').length || 0}
                </span>
            </button>
            
            <button 
                onClick={() => setActiveTab('PAID')}
                className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${activeTab === 'PAID' ? 'bg-white dark:bg-slate-800 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <CheckCircle size={18}/> PAGADAS
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">
                    {data?.allProformas.filter((p:any) => p.status === 'PAID').length || 0}
                </span>
            </button>
        </div>

        {/* TABLA */}
        <div className="bg-white dark:bg-slate-800 rounded-b-2xl rounded-tr-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Nº</th>
                <th className="p-4 font-bold">Fecha</th>
                <th className="p-4 font-bold">Cliente</th>
                <th className="p-4 font-bold">Vehículo</th>
                <th className="p-4 font-bold text-right">Total</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Cargando...</td></tr>}
              {error && <tr><td colSpan={6} className="p-8 text-center text-red-500">Error: {error.message}</td></tr>}
              
              {filteredProformas.map((proforma: any) => (
                <tr key={proforma.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors">
                  <td className="p-4 font-mono text-slate-400 font-bold">#{proforma.id}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">{proforma.createdAt}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800 dark:text-white">{proforma.client.name}</div>
                    <div className="text-xs text-slate-400">{proforma.client.phone || '-'}</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">{proforma.vehicleRef}</td>
                  <td className="p-4 text-right font-bold text-slate-800 dark:text-white">{proforma.total} Bs</td>
                  
                  <td className="p-4 text-center flex items-center justify-center gap-2">
                    {/* BOTÓN COBRAR (Solo si está pendiente) */}
                    {proforma.status === 'PENDING' && (
                        <button 
                            onClick={() => handleCobrar(proforma.id)}
                            className="inline-flex p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors items-center gap-1 text-xs font-bold"
                            title="Marcar como Pagado"
                        >
                            <DollarSign size={16} /> Cobrar
                        </button>
                    )}

                    {/* BOTÓN VER PDF */}
                    <a 
                        href={`http://127.0.0.1:8000/pdf/${proforma.id}/`} 
                        target="_blank" 
                        className="inline-flex p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors"
                        title="Ver Factura PDF"
                    >
                        <FileText size={20} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}