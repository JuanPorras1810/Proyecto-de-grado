import React, { useState } from 'react';
import { DBController } from '../../controllers/dbController';
import { Clock, UserCheck, Coffee, LogIn, LogOut, Search, Filter, Check, X, ShieldAlert, User } from 'lucide-react';
import { UserSession } from '../../types/db';

interface TimeRegistryViewProps {
  session?: UserSession;
}

export const TimeRegistryView: React.FC<TimeRegistryViewProps> = ({ session }) => {
  const isSupervisor = session?.role === 'supervisor';
  const currentAgentId = session?.userId;

  const db = DBController.getInstance();

  // Estados de filtros y búsquedas
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState('2026-05-30');
  const [fechaFin, setFechaFin] = useState('2026-06-29');

  const agentes = db.getAgentes();
  const regAgentes = db.getRegistroAgentes();

  // Mapear unificados para visualización y filtrado (solo agentes)
  interface UnifiedRegistry {
    cod: number;
    role: 'Agente';
    docId: string;
    nombre: string;
    inicio: string;
    cierre?: string;
    total?: string;
  }

  let unificados: UnifiedRegistry[] = [
    ...regAgentes.map(r => ({
      cod: r.codRegAge,
      role: 'Agente' as const,
      docId: r.idAgeRegAge,
      nombre: agentes.find(a => a.idAge === r.idAgeRegAge)?.nomAge || `Agente ${r.idAgeRegAge}`,
      inicio: r.fecHoraIniRegAge,
      cierre: r.fecHoraCieRegAge,
      total: r.tieTotRegAge
    }))
  ].sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());

  if (!isSupervisor && currentAgentId) {
    unificados = unificados.filter(item => item.docId === currentAgentId);
  }

  // Filtrado combinado
  const filtered = unificados.filter(item => {
    // Filtro por fecha
    const itemDate = item.inicio.split('T')[0];
    const dateMatch = (!fechaInicio || itemDate >= fechaInicio) && (!fechaFin || itemDate <= fechaFin);
    if (!dateMatch) return false;

    // Filtro por persona exacta elegida en select (solo supervisor)
    if (isSupervisor && selectedPerson && item.docId !== selectedPerson) return false;

    // Búsqueda libre por texto
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNom = item.nombre.toLowerCase().includes(q);
      const matchDoc = item.docId.includes(q);
      if (!matchNom && !matchDoc) return false;
    }

    return true;
  });

  return (
    <div className="p-8 space-y-6 animate-fadeIn select-none text-left max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-blue-600" />
            {isSupervisor ? 'Registro Operativo de Tiempos y Asistencia' : 'Mi Registro de Tiempos y Asistencia'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isSupervisor
              ? 'Visualiza todos los turnos, filtra por fecha, agente o realiza búsquedas libres'
              : 'Visualiza tu historial de turnos y tiempos de sesión acumulados en la plataforma'}
          </p>
        </div>
      </div>

      {/* Contenedor de Búsqueda y Filtros con diseño idéntico al de la imagen */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-end gap-5">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Fecha Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Fecha Fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Solo Supervisor puede buscar por Agente */}
        {isSupervisor && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Buscar por Agente</label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="">-- Todos los Agentes --</option>
              {agentes.map(a => (
                <option key={a.idAge} value={a.idAge}>{a.nomAge} (CdC {a.idAge})</option>
              ))}
            </select>
          </div>
        )}

        {/* Buscador de texto secundario */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Cód. Reg.</th>
                <th className="py-3.5 px-6">Agente / Aprendiz</th>
                <th className="py-3.5 px-6">Documento ID</th>
                <th className="py-3.5 px-6">Inicio (Login)</th>
                <th className="py-3.5 px-6">Cierre (Logout)</th>
                <th className="py-3.5 px-6">Tiempo Total</th>
                <th className="py-3.5 px-6">Novedades / Pausa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((r) => {
                return (
                  <tr key={`${r.role}-${r.cod}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-xs text-slate-500">#{r.cod}</td>
                    <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-500" />
                      <span>{r.nombre}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">{r.docId}</td>
                    <td className="py-4 px-6 font-mono text-xs text-emerald-700 font-bold">
                      <span className="flex items-center gap-1.5">
                        <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                        {new Date(r.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + r.inicio.split('T')[0] + ')'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      {r.cierre ? (
                        <span className="text-red-600 font-bold flex items-center gap-1.5">
                          <LogOut className="w-3.5 h-3.5" />
                          {new Date(r.cierre).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + r.cierre.split('T')[0] + ')'}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold animate-pulse inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          En sesión
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono font-black text-slate-800">
                      {r.total || 'En curso...'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                        <Coffee className="w-3.5 h-3.5 text-amber-600" />
                        15m (Pausa)
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm font-medium">
                    No se encontraron registros de tiempo con los criterios de búsqueda actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
