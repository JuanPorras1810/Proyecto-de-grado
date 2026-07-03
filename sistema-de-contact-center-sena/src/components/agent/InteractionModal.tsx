import React, { useState, useEffect } from 'react';
import { DBController } from '../../controllers/dbController';
import { BaseDatosCliente, Campana, UserSession } from '../../types/db';
import { PhoneCall, Clock, AlertTriangle, CheckCircle, Ticket, X } from 'lucide-react';

interface InteractionModalProps {
  session: UserSession;
  clienteInicial?: BaseDatosCliente;
  campanaInicial?: Campana;
  onClose: () => void;
  onSuccess: () => void;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({
  session,
  clienteInicial,
  campanaInicial,
  onClose,
  onSuccess
}) => {
  const db = DBController.getInstance();
  const clientes = db.getClientes();
  const campanas = db.getCampanas();
  const tipificaciones = db.getTipificaciones();
  const canales = db.getConfigTablas().canales;

  // Cronómetro operativo de atención
  const [segundos, setSegundos] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSegundos(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTiempo = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' + m : m}m ${s < 10 ? '0' + s : s}s`;
  };

  const [selectedCli, setSelectedCli] = useState<number>(clienteInicial?.conCli || clientes[0]?.conCli || 1);
  const [selectedCam, setSelectedCam] = useState<number>(campanaInicial?.codCam || campanas[0]?.codCam || 1);
  const [idCanInt, setIdCanInt] = useState(1); // Llamada
  const [codTipInt, setCodTipInt] = useState(tipificaciones[0]?.codTip || 1);
  
  // 1: Abierto, 2: Cerrado, 3: Escalado
  const [idEstCasInt, setIdEstCasInt] = useState<number>(2); 
  const [motInt, setMotInt] = useState('');
  const [obsInt, setObsInt] = useState('');

  // Datos obligatorios del ticket si es Abierto o Escalado (Comentarios del caso)
  const [comIntCas, setComIntCas] = useState('');
  const [errorRegla, setErrorRegla] = useState('');

  const activeClientObj = clientes.find(c => c.conCli === Number(selectedCli));
  const activeCamObj = campanas.find(c => c.codCam === Number(selectedCam));

  // Autocompletar motivo sugerido y actualizar campaña si cambia cliente
  useEffect(() => {
    if (activeClientObj) {
      setSelectedCam(activeClientObj.codCamCli);
      setMotInt(`Contacto con ${activeClientObj.nomCli} - ${campanas.find(c => c.codCam === activeClientObj.codCamCli)?.nomCam || ''}`);
    }
  }, [selectedCli]);

  // Actualizar la tipificación seleccionada por defecto si cambia la campaña
  useEffect(() => {
    const validTips = tipificaciones.filter(t => t.codCamTip === Number(selectedCam));
    if (validTips.length > 0) {
      setCodTipInt(validTips[0].codTip);
    }
  }, [selectedCam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRegla('');

    // VALIDACIÓN ESTRICTA REQUERIDA POR EL USUARIO:
    // Si idEstCasInt es 1 (Abierto) o 3 (Escalado), NO dejar guardar hasta que diligencie el caso (ticket)
    if (idEstCasInt === 1 || idEstCasInt === 3) {
      if (!comIntCas.trim()) {
        setErrorRegla('REGLA DE NEGOCIO OBLIGATORIA: Ha seleccionado el estado ' + (idEstCasInt === 1 ? '"Abierto"' : '"Escalado"') + '. El sistema no permite registrar el contacto hasta que escriba los Comentarios del caso (Ticket).');
        return;
      }
    }

    try {
      const hoy = new Date().toISOString().split('T')[0];
      const ahora = new Date();
      const horFin = ahora.toTimeString().split(' ')[0];
      const iniTime = new Date(ahora.getTime() - segundos * 1000).toTimeString().split(' ')[0];

      // Encontrar id del asesor actual (conAseInt) en baseDatosAsesor
      const baseAse = db.getBaseAsesores().find(ba => ba.idAgeAse === session.userId);
      const conAseValido = baseAse ? baseAse.conAse : 1;

      db.registrarContacto(
        {
          conAseInt: conAseValido,
          conCliInt: Number(selectedCli),
          codTipInt: Number(codTipInt),
          idCanInt: Number(idCanInt),
          idEstCasInt: Number(idEstCasInt),
          motInt,
          fecInt: hoy,
          horIniInt: iniTime,
          horFinInt: horFin,
          tieProInt: formatTiempo(segundos),
          obsInt,
          resultado: undefined // Se quitan los resultados porque eso va en la observación
        },
        (idEstCasInt === 1 || idEstCasInt === 3)
          ? {
              comIntCas: comIntCas.trim(),
              estado: idEstCasInt === 1 ? 'Abierto' : 'Escalado'
            }
          : undefined
      );

      onSuccess();
    } catch (err: any) {
      setErrorRegla(err.message || 'Error al guardar contacto');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-fadeIn my-6">
        {/* Encabezado Operativo */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Gestión Operativa - Registro de Interacción</h3>
              <p className="text-xs text-blue-100 flex items-center gap-2">
                <span>Agente: {session.userName}</span>
                <span>•</span>
                <span className="font-mono bg-blue-900/60 px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTiempo(segundos)}
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar text-left">
          
          {/* SECCIÓN CLIENTE ASIGNADO AUTOMÁTICAMENTE */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Cliente Asignado Automáticamente
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">El sistema asignó un contacto para operar de inmediato</p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Cambiar Cliente:</label>
                <select
                  value={selectedCli}
                  onChange={(e) => setSelectedCli(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                >
                  {clientes.map(c => (
                    <option key={c.conCli} value={c.conCli}>{c.nomCli} - ID: {c.idCli}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ficha Técnica Detallada del Cliente */}
            {activeClientObj && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                {/* Datos Requeridos */}
                <div className="space-y-2.5">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Nombre del Cliente:</span>
                    <p className="text-xs font-black text-slate-900">{activeClientObj.nomCli}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Campaña Perteneciente:</span>
                    <p className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block mt-0.5">
                      {activeCamObj?.nomCam || 'No asignada'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Correo Electrónico:</span>
                    <p className="text-xs font-bold text-slate-800 font-mono">{activeClientObj.emaCli}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Teléfono de Contacto:</span>
                    <p className="text-xs font-bold font-mono text-slate-800">{activeClientObj.telCli}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Teléfono Alternativo:</span>
                    <p className="text-xs font-bold font-mono text-slate-800">{activeClientObj.telAltCli || 'No registrado'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Documento de Identidad (idCli):</span>
                    <p className="text-xs font-bold font-mono text-slate-700">{activeClientObj.idCli}</p>
                  </div>
                </div>

                {/* Lo demás: Otros datos de la base de datos */}
                <div className="md:col-span-2 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Dirección Residencial:</span>
                    <p className="text-xs font-semibold text-slate-700">{activeClientObj.dirCli}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Observación/Nota del Cliente:</span>
                    <p className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-100 font-medium italic">
                      {activeClientObj.obsCli || 'Sin observaciones previas.'}
                    </p>
                  </div>
                </div>
              </div>
            )}


          </div>

          {/* Fila 2: Canal, Tipificación y Estado de Cierre de Caso */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Canal de Contacto</label>
              <select
                value={idCanInt}
                onChange={(e) => setIdCanInt(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold bg-white"
              >
                {canales.map(can => (
                  <option key={can.idCanInt} value={can.idCanInt}>{can.nomCanInt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tipificación Operativa</label>
              <select
                value={codTipInt}
                onChange={(e) => setCodTipInt(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
              >
                {(() => {
                  const validTips = tipificaciones.filter(t => t.codCamTip === Number(selectedCam));
                  const finalTips = validTips.length > 0 ? validTips : tipificaciones.filter(t => t.codCamTip === 1 || t.codCamTip === 2 || t.codCamTip === 3);
                  return finalTips.map(t => (
                    <option key={t.codTip} value={t.codTip}>{t.nomTip}</option>
                  ));
                })()}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cierre del Caso (Estado) *</label>
              <select
                value={idEstCasInt}
                onChange={(e) => setIdEstCasInt(Number(e.target.value))}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-black shadow-sm bg-white ${
                  idEstCasInt === 2 ? 'bg-emerald-50 text-emerald-800 border-emerald-400' :
                  idEstCasInt === 3 ? 'bg-amber-50 text-amber-800 border-amber-400' :
                  'bg-blue-50 text-blue-800 border-blue-400'
                }`}
              >
                <option value={2}>Cerrado</option>
                <option value={1}>Abierto</option>
                <option value={3}>Escalado</option>
              </select>
            </div>
          </div>

          {/* Motivo y Observaciones */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Motivo del Contacto *</label>
              <input
                type="text"
                required
                value={motInt}
                onChange={(e) => setMotInt(e.target.value)}
                placeholder="Ej. Consulta de factura y retención de servicio"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Observaciones de la Gestión * (Incluye Resultados/Acuerdos)</label>
              <textarea
                rows={3}
                required
                value={obsInt}
                onChange={(e) => setObsInt(e.target.value)}
                placeholder="Escriba aquí el resumen detallado de la conversación y el acuerdo o resultado logrado con el cliente..."
                className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          {/* SECCIÓN OBLIGATORIA DE TICKET (SI ESTADO ES ABIERTO O ESCALADO) */}
          {(idEstCasInt === 1 || idEstCasInt === 3) && (
            <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-400 space-y-4 animate-fadeIn shadow-inner">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm border-b border-blue-200 pb-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                <span>Creación Obligatoria de Ticket de Seguimiento ({idEstCasInt === 1 ? 'Caso Abierto' : 'Caso Escalado'})</span>
              </div>
              <p className="text-xs text-blue-800 font-medium">
                Al seleccionar el estado {idEstCasInt === 1 ? 'Abierto' : 'Escalado'}, el sistema requiere registrar la bitácora inicial del Ticket.
              </p>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase mb-1">Comentarios del caso *</label>
                <textarea
                  rows={3}
                  required
                  value={comIntCas}
                  onChange={(e) => setComIntCas(e.target.value)}
                  placeholder="Escriba los comentarios del caso, requerimientos técnicos, visita técnica o detalles del escalamiento..."
                  className="w-full bg-white border border-blue-400 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          )}

          {errorRegla && (
            <div className="p-4 bg-red-600 text-white rounded-xl text-xs font-bold flex items-start gap-2 shadow-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorRegla}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Descartar Contacto
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Guardar y Finalizar Contacto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
