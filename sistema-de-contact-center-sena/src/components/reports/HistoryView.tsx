import React, { useState } from 'react';
import { DBController } from '../../controllers/dbController';
import { UserSession } from '../../types/db';
import { History, Search, Phone, Ticket, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface HistoryViewProps {
  session: UserSession;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ session }) => {
  const db = DBController.getInstance();
  const interacciones = db.getInteracciones();
  const agentes = db.getAgentes();
  const clientes = db.getClientes();
  const casos = db.getCasos();

  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('2026-05-30');
  const [fechaFin, setFechaFin] = useState('2026-06-29');
  const [contentType, setContentType] = useState<'contactos' | 'tickets'>('contactos');

  const isSupervisor = session.role === 'supervisor';
  
  // Encontrar códigos de asesores vinculados a este agente
  const myConAseList = db.getBaseAsesores()
    .filter(ba => ba.idAgeAse === session.userId)
    .map(ba => ba.conAse);

  // Filtrar interacciones según rol
  const displayItems = isSupervisor
    ? interacciones
    : interacciones.filter(i => myConAseList.includes(i.conAseInt));

  // Filtrar casos/tickets según rol
  const displayCasos = isSupervisor
    ? casos
    : casos.filter(c => c.agenteAsignado === session.userId);

  const getAgentName = (conAse: number | string) => {
    const b = db.getBaseAsesores().find(ba => ba.conAse === conAse || ba.idAgeAse === conAse);
    return b ? (agentes.find(a => a.idAge === b.idAgeAse)?.nomAge || `Asesor #${conAse}`) : `Asesor #${conAse}`;
  };

  const getClientName = (conCli: number) => {
    return clientes.find(c => c.conCli === conCli)?.nomCli || `Cliente #${conCli}`;
  };

  // Filtrar interacciones por rango de fecha y búsqueda
  const filteredInteracciones = displayItems.filter(i => {
    const dateMatch = (!fechaInicio || i.fecInt >= fechaInicio) && (!fechaFin || i.fecInt <= fechaFin);
    const textMatch = i.motInt.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      i.obsInt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      getClientName(i.conCliInt).toLowerCase().includes(searchTerm.toLowerCase());
    return dateMatch && textMatch;
  });

  // Filtrar casos por rango de fecha y búsqueda
  const filteredCasos = displayCasos.filter(c => {
    const dateMatch = (!fechaInicio || c.fecIniCas >= fechaInicio) && (!fechaFin || c.fecIniCas <= fechaFin);
    const textMatch = c.comIntCas.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      c.codCas.toString().includes(searchTerm);
    return dateMatch && textMatch;
  });

  return (
    <div className="p-8 space-y-6 animate-fadeIn select-none text-left max-w-7xl mx-auto">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-indigo-600" />
          {isSupervisor ? 'Historial de Gestiones y Evolución Operativa' : 'Mi Historial de Contactos'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isSupervisor ? 'Vista de Supervisor: Bitácora completa y trazabilidad de todo el equipo de aprendices' : 'Mi bitácora individual de contactos realizados'}
        </p>
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

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setContentType('contactos')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
              contentType === 'contactos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            Contactos
          </button>

          <button
            type="button"
            onClick={() => setContentType('tickets')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
              contentType === 'tickets'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Tickets
          </button>
        </div>

        {/* Buscador de texto secundario */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={contentType === 'contactos' ? 'Buscar en contactos...' : 'Buscar en tickets...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {contentType === 'contactos' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Cód.</th>
                  <th className="py-3.5 px-6">Fecha/Hora</th>
                  <th className="py-3.5 px-6">Agente Responsable</th>
                  <th className="py-3.5 px-6">Cliente Contactado</th>
                  <th className="py-3.5 px-6">Motivo y Observaciones</th>
                  <th className="py-3.5 px-6">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInteracciones.map((item) => (
                  <tr key={item.codInt} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-xs text-indigo-600">#{item.codInt}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">{item.fecInt} {item.horIniInt}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{getAgentName(item.conAseInt)}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{getClientName(item.conCliInt)}</td>
                    <td className="py-4 px-6 max-w-sm">
                      <p className="font-bold text-xs text-slate-800">{item.motInt}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.obsInt}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-bold text-xs border border-indigo-200">
                        {item.resultado || 'Gestión finalizada'}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredInteracciones.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm font-medium">
                      No se encontraron contactos en el periodo o criterio seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Caso #</th>
                  <th className="py-3.5 px-6">Fecha Inicio</th>
                  <th className="py-3.5 px-6">Fecha Cierre</th>
                  <th className="py-3.5 px-6">Agente Asignado</th>
                  <th className="py-3.5 px-6">Comentario / Bitácora</th>
                  <th className="py-3.5 px-6">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCasos.map((casoItem) => {
                  const agentObj = agentes.find(a => a.idAge === casoItem.agenteAsignado);
                  return (
                    <tr key={casoItem.codCas} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-xs text-blue-600">TK-{casoItem.codCas}</td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">{casoItem.fecIniCas}</td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">{casoItem.fecCieCas || 'Abierto'}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{agentObj?.nomAge || casoItem.agenteAsignado || 'No asignado'}</td>
                      <td className="py-4 px-6 max-w-sm truncate text-xs text-slate-700">{casoItem.comIntCas}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          casoItem.estado === 'Cerrado' ? 'bg-green-100 text-green-800' :
                          casoItem.estado === 'Escalado' ? 'bg-red-100 text-red-800 animate-pulse' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {casoItem.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredCasos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm font-medium">
                      No se encontraron tickets en el periodo o criterio seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
