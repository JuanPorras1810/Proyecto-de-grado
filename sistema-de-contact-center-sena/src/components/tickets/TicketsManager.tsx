import React, { useState } from 'react';
import { DBController } from '../../controllers/dbController';
import { Caso } from '../../types/db';
import { Ticket, MessageSquarePlus, CheckCircle2, AlertCircle, Clock, ShieldAlert, ArrowUpRight, Search } from 'lucide-react';

export const TicketsManager: React.FC = () => {
  const db = DBController.getInstance();
  const [casos, setCasos] = useState<Caso[]>(db.getCasos());
  const agentes = db.getAgentes();

  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<Caso | null>(null);
  const [newComment, setNewComment] = useState('');

  const handleUpdateStatus = (codCas: number, est: Caso['estado']) => {
    db.actualizarCaso(codCas, est);
    setCasos([...db.getCasos()]);
    if (selectedCase?.codCas === codCas) {
      setSelectedCase({ ...selectedCase, estado: est });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newComment.trim()) return;
    db.actualizarCaso(selectedCase.codCas, selectedCase.estado, newComment.trim());
    setCasos([...db.getCasos()]);
    setSelectedCase(db.getCasos().find(c => c.codCas === selectedCase.codCas) || null);
    setNewComment('');
  };

  const getAgentName = (idAge: string) => {
    return agentes.find(a => a.idAge === idAge)?.nomAge || `Asesor ${idAge}`;
  };

  const filtered = casos.filter(c => {
    const matchEstado = filterEstado === 'todos' || c.estado === filterEstado;
    const matchSearch = c.comIntCas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.codCas.toString().includes(searchTerm) ||
                        (c.agenteAsignado && c.agenteAsignado.toString().includes(searchTerm));
    return matchEstado && matchSearch;
  });

  return (
    <div className="p-8 space-y-8 animate-fadeIn select-none text-left border-t border-slate-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-amber-600" />
            Módulo de Seguimiento de Casos (Tickets)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Auditoría, escalamiento, comentarios internos y resolución operativa</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar ticket o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm text-xs font-bold w-full sm:w-auto">
            {['todos', 'Abierto', 'Cerrado', 'Escalado'].map((est) => (
              <button
                key={est}
                onClick={() => setFilterEstado(est)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterEstado === est ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {est === 'todos' ? 'Todos' : est}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla Tickets */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Ticket #</th>
                  <th className="py-3.5 px-6">Fecha</th>
                  <th className="py-3.5 px-6">Bitácora / Comentario Inicial</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((casoItem) => (
                  <tr
                    key={casoItem.codCas}
                    onClick={() => setSelectedCase(casoItem)}
                    className={`cursor-pointer transition-colors ${
                      selectedCase?.codCas === casoItem.codCas ? 'bg-amber-50/80 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-4 px-6 font-mono font-black text-amber-600">TK-{casoItem.codCas}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">{casoItem.fecIniCas}</td>
                    <td className="py-4 px-6 max-w-xs truncate text-xs text-slate-700">{casoItem.comIntCas}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        casoItem.estado === 'Cerrado' ? 'bg-green-100 text-green-800' :
                        casoItem.estado === 'Escalado' ? 'bg-red-100 text-red-800 animate-pulse' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {casoItem.estado}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-blue-600 font-bold text-xs flex items-center gap-1">
                      <span>Inspeccionar</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      No hay tickets en este estado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Detalle de Ticket */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          {selectedCase ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Inspección de Ticket</span>
                  <h3 className="text-xl font-black text-slate-800 font-mono">TK-{selectedCase.codCas}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  selectedCase.estado === 'Cerrado' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedCase.estado}
                </span>
              </div>

              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <p><span className="font-bold text-slate-500 uppercase">Agente Asignado:</span> <span className="font-bold text-slate-800">{getAgentName(selectedCase.agenteAsignado || '')}</span></p>
                <p><span className="font-bold text-slate-500 uppercase">Apertura:</span> <span className="font-mono">{selectedCase.fecIniCas}</span></p>
                <p><span className="font-bold text-slate-500 uppercase">Interacción Cód:</span> <span className="font-mono text-blue-600 font-bold">#{selectedCase.codIntCas}</span></p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Bitácora e Historial del Caso:</span>
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto custom-scrollbar border border-slate-800">
                  {selectedCase.comIntCas}
                </div>
              </div>

              {/* Botones de Cambio de Estado */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Actualizar Estado Operativo:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedCase.codCas, 'Abierto')}
                    className="bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    Abierto
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedCase.codCas, 'Escalado')}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    Escalado
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedCase.codCas, 'Cerrado')}
                    className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cerrado
                  </button>
                </div>
              </div>

              {/* Agregar Comentario */}
              <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-600 uppercase">Agregar Comentario Interno:</label>
                <textarea
                  rows={2}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escriba aquí el avance o seguimiento..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  Guardar Bitácora
                </button>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Ticket className="w-12 h-12 stroke-1 mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Ningún Ticket Seleccionado</p>
              <p className="text-xs mt-1 max-w-xs">Haga clic en cualquier fila de la tabla izquierda para inspeccionar y comentar el caso.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
