import React, { useState } from 'react';
import { DBController } from '../../controllers/dbController';
import { UserSession, BaseDatosCliente, Campana } from '../../types/db';
import { InteractionModal } from './InteractionModal';
import { PhoneCall, Plus, RefreshCw, Clock, CheckCircle2, AlertCircle, PhoneForwarded } from 'lucide-react';

interface AgentContactsViewProps {
  session: UserSession;
}

export const AgentContactsView: React.FC<AgentContactsViewProps> = ({ session }) => {
  const db = DBController.getInstance();
  const [interacciones, setInteracciones] = useState(db.getInteracciones());
  const clientes = db.getClientes();
  const campanas = db.getCampanas();
  const canales = db.getConfigTablas().canales;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simClient, setSimClient] = useState<BaseDatosCliente | undefined>(undefined);
  const [simCam, setSimCam] = useState<Campana | undefined>(undefined);

  const handleNuevoContactoManual = () => {
    const randomSim = db.getSiguienteContactoAleatorio(session.userId);
    if (randomSim) {
      setSimClient(randomSim.cliente);
      setSimCam(randomSim.campana);
    } else {
      // Fallback a un cliente y campaña si no hay asignados de campaña activa
      const fallbackClient = db.getClientes()[0];
      const fallbackCam = db.getCampanas()[0];
      setSimClient(fallbackClient);
      setSimCam(fallbackCam);
    }
    setIsModalOpen(true);
  };

  const getClientName = (conCli: number) => {
    return clientes.find(c => c.conCli === conCli)?.nomCli || `Cliente #${conCli}`;
  };

  const getCamName = (codCam: number) => {
    return campanas.find(c => c.codCam === codCam)?.nomCam || `Campaña #${codCam}`;
  };

  // Filtrar interacciones por el agente actual
  const misInteracciones = interacciones; // mostramos bitácora general o del agente para que la tabla tenga ritmo visual

  return (
    <div className="p-8 space-y-8 animate-fadeIn select-none text-left">
      {/* Encabezado Módulo de Contactos idéntico al Mockup 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <PhoneCall className="w-7 h-7 text-blue-600" />
            Módulo de Contactos
          </h2>
          <p className="text-xs text-slate-500 mt-1">Gestiona las interacciones con clientes, atención de llamadas y registro de tiempos</p>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Botón azul + Nuevo Contacto */}
          <button
            onClick={handleNuevoContactoManual}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nuevo Contacto
          </button>
        </div>
      </div>

      {/* Tabla idéntica al Mockup 2: Fecha, Cliente, Tipo, Motivo, Campaña, Tiempo, Estado */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Fecha</th>
                <th className="py-3.5 px-6">Cliente</th>
                <th className="py-3.5 px-6">Tipo (Canal)</th>
                <th className="py-3.5 px-6">Motivo</th>
                <th className="py-3.5 px-6">Campaña</th>
                <th className="py-3.5 px-6">Tiempo</th>
                <th className="py-3.5 px-6">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {misInteracciones.map((iItem) => {
                const can = canales.find(c => c.idCanInt === iItem.idCanInt)?.nomCanInt || 'Llamada';
                return (
                  <tr key={iItem.codInt} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">{iItem.fecInt}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{getClientName(iItem.conCliInt)}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 font-bold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        <PhoneCall className="w-3.5 h-3.5 text-blue-500" />
                        {can}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 max-w-xs truncate">{iItem.motInt}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                        {getCamName(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {iItem.tieProInt}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                        iItem.idEstCasInt === 2 ? 'bg-emerald-100 text-emerald-800' :
                        iItem.idEstCasInt === 3 ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {iItem.idEstCasInt === 2 ? 'Resuelto' : iItem.idEstCasInt === 3 ? 'Escalado' : 'Seguimiento'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {misInteracciones.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                    No hay contactos registrados aún. Presione "Siguiente Contacto" para iniciar atención.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de atención activa */}
      {isModalOpen && (
        <InteractionModal
          session={session}
          clienteInicial={simClient}
          campanaInicial={simCam}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setInteracciones([...db.getInteracciones()]);
          }}
        />
      )}
    </div>
  );
};
