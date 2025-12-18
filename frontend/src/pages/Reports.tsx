import { useQuery, gql } from '@apollo/client';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Reusamos la query para calcular en el cliente (forma rápida)
const GET_ALL_DATA = gql`
  query GetAllData {
    allProformas {
      id
      total
      status
      createdAt
    }
  }
`;

export default function Reports() {
  const { data, loading } = useQuery(GET_ALL_DATA);

  // Cálculos Simples
  const proformas = data?.allProformas || [];
  const totalGenerado = proformas.reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);
  const totalPendiente = proformas.filter((p:any) => p.status === 'PENDING')
                                  .reduce((acc: number, curr: any) => acc + parseFloat(curr.total), 0);
  
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans dark:from-slate-900 dark:to-slate-950 dark:bg-gradient-to-br">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="p-3 bg-white rounded-full text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Reporte General</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Tarjeta 1: Total Histórico */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg dark:from-indigo-900 dark:to-purple-900">
                <div className="flex items-center gap-3 mb-2 opacity-80">
                    <DollarSign size={20}/> <span>Total Generado (Histórico)</span>
                </div>
                <div className="text-4xl font-black">{totalGenerado.toFixed(2)} Bs</div>
            </div>

            {/* Tarjeta 2: Por Cobrar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg">
                <div className="flex items-center gap-3 mb-2 text-amber-600 font-bold">
                    <Clock size={20}/> <span>Pendiente por Cobrar</span>
                </div>
                <div className="text-4xl font-black text-slate-800">{totalPendiente.toFixed(2)} Bs</div>
                <p className="text-xs text-slate-400 mt-2">Dinero en la calle</p>
            </div>

            {/* Tarjeta 3: Cantidad Trabajos */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg">
                 <div className="flex items-center gap-3 mb-2 text-emerald-600 font-bold">
                    <TrendingUp size={20}/> <span>Trabajos Realizados</span>
                </div>
                <div className="text-4xl font-black text-slate-800">{proformas.length}</div>
                <p className="text-xs text-slate-400 mt-2">Proformas emitidas</p>
            </div>
        </div>

      </div>
    </div>
  );
}