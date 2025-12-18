import { FileText, History, Truck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm mb-4">
            <Truck size={40} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Taller Metalúrgico Vallegrande</h1>
          <p className="text-slate-500 text-lg dark:text-slate-400">Sistema de Gestión de Proformas</p>
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* BOTÓN 1: NUEVA PROFORMA */}
          <Link to="/create" className="group relative bg-white dark:bg-slate-800 dark:border-slate-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText size={120} className="text-indigo-600" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform shadow-inner">
                <FileText size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Nueva Pro-Forma</h2>
              <p className="text-slate-500 dark:text-slate-400">Crear una cotización, registrar clientes nuevos y generar PDF.</p>
            </div>
          </Link>

          {/* BOTÓN 2: HISTORIAL */}
          <Link to="/history" className="group relative bg-white dark:bg-slate-800 dark:border-slate-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <History size={120} className="text-emerald-600" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform shadow-inner">
                <History size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Historial y Registros</h2>
              <p className="text-slate-500 dark:text-slate-400">Ver proformas pasadas, buscar por cliente y revisar pagos.</p>
            </div>
          </Link>

          {/* BOTÓN 3: REPORTES */}
          <Link to="/reports" className="group relative bg-white dark:bg-slate-800 dark:border-slate-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer md:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={120} className="text-blue-500" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform shadow-inner">
                <TrendingUp size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Reportes</h2>
              <p className="text-slate-500 dark:text-slate-400">Ver ganancias totales y dinero pendiente.</p>
            </div>
          </Link>

        </div>

        <div className="mt-12 text-center text-slate-400 dark:text-slate-600 text-sm">
          Versión 1.0 • Desarrollado para Metalúrgica Vallegrande
        </div>
      </div>
    </div>
  );
}