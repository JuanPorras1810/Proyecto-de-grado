import React, { useState } from 'react';
import { DBController } from '../../controllers/dbController';
import { Agente, Campana } from '../../types/db';
import { Plus, Trash2, X, Search, Edit2, Users, Target, UserCheck } from 'lucide-react';

type ActiveSubTab = 'asignaciones' | 'gestion_agentes';

export const AsesoresCampana: React.FC = () => {
  const db = DBController.getInstance();
  const [baseAsesores, setBaseAsesores] = useState(() => db.getBaseAsesores());
  const [agentes, setAgentes] = useState(() => db.getAgentes());
  const campanas = db.getCampanas();
  
  const geo = db.getGeografia();
  const departamentos = geo.departamentos || [];
  const municipios = geo.municipios || [];
  const barrios = geo.barrios || [];
  const tiposDoc = db.getConfigTablas().tiposDoc;

  const [activeTab, setActiveTab] = useState<ActiveSubTab>('gestion_agentes');

  // --- Estados para Asignaciones ---
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingAsesor, setEditingAsesor] = useState<any | null>(null);
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedCam, setSelectedCam] = useState<number>(1);
  const [selectedCampanaFilter, setSelectedCampanaFilter] = useState<string>('todas');
  const [searchAsignacion, setSearchAsignacion] = useState('');

  // --- Estados para Gestión de Agentes/Aprendices ---
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agente | null>(null);
  const [searchAgent, setSearchAgent] = useState('');

  // Formulario Agente
  const [idAge, setIdAge] = useState('');
  const [idTipDocAge, setIdTipDocAge] = useState<number>(1);
  const [nomAge, setNomAge] = useState('');
  const [emaAge, setEmaAge] = useState('');
  const [dirAge, setDirAge] = useState('');
  const [telAge, setTelAge] = useState('');
  const [telAltAge, setTelAltAge] = useState('');
  const [selectedDepId, setSelectedDepId] = useState<number>(1);
  const [selectedMunId, setSelectedMunId] = useState<number>(1);
  const [idBarAge, setIdBarAge] = useState<number>(1);
  const [conAge, setConAge] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // --- Acciones de Asignación ---
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAge || !selectedCam) return;
    
    if (editingAsesor) {
      db.updateAsignacionAsesor(editingAsesor.conAse, selectedAge, Number(selectedCam));
    } else {
      db.asignarAgenteACampana(selectedAge, Number(selectedCam));
    }
    
    setBaseAsesores([...db.getBaseAsesores()]);
    setShowAssignModal(false);
    setEditingAsesor(null);
  };

  const handleEditAsignacion = (ba: any) => {
    setEditingAsesor(ba);
    setSelectedAge(ba.idAgeAse);
    setSelectedCam(ba.codCamAse);
    setShowAssignModal(true);
  };

  const handleRemoveAsignacion = (conAse: number) => {
    if (confirm('¿Está seguro de eliminar esta asignación de asesor a campaña?')) {
      db.desasignarAgenteDeCampana(conAse);
      setBaseAsesores([...db.getBaseAsesores()]);
    }
  };

  const getAgentName = (id: string) => {
    return agentes.find(a => a.idAge === id)?.nomAge || `Agente (${id})`;
  };

  const getCamName = (codCam: number) => {
    return campanas.find(c => c.codCam === codCam)?.nomCam || `Campaña #${codCam}`;
  };

  const getFechaAsignacion = (index: number) => {
    const mes = ((index * 2) % 12) + 1;
    const dia = ((index * 5) % 28) + 1;
    return `2026-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  };

  // --- Acciones de Agentes (CRUD) ---
  const handleOpenAgentModal = (agent?: Agente) => {
    if (agent) {
      setEditingAgent(agent);
      setIdAge(agent.idAge);
      setIdTipDocAge(agent.idTipDocAge);
      setNomAge(agent.nomAge);
      setEmaAge(agent.emaAge);
      setDirAge(agent.dirAge);
      setTelAge(agent.telAge);
      setTelAltAge(agent.telAltAge || '');
      setIdBarAge(agent.idBarAge);
      setConAge(agent.conAge);
      setAvatarUrl(agent.avatarUrl || '');

      // Inicializar dpto y municipio correspondientes a agent.idBarAge
      const currentBar = barrios.find(b => b.idBar === agent.idBarAge) || barrios[0];
      const currentMun = currentBar ? (municipios.find(m => m.idMun === currentBar.idMunBar) || municipios[0]) : municipios[0];
      const currentDep = currentMun ? (departamentos.find(d => d.idDep === currentMun.idDepMun) || departamentos[0]) : departamentos[0];

      setSelectedDepId(currentDep ? currentDep.idDep : 1);
      setSelectedMunId(currentMun ? currentMun.idMun : 1);
    } else {
      setEditingAgent(null);
      setIdAge('');
      setIdTipDocAge(tiposDoc[0]?.idTipDoc || 1);
      setNomAge('');
      setEmaAge('');
      setDirAge('');
      setTelAge('');
      setTelAltAge('');
      
      const firstBar = barrios[0];
      const firstMun = firstBar ? (municipios.find(m => m.idMun === firstBar.idMunBar) || municipios[0]) : municipios[0];
      const firstDep = firstMun ? (departamentos.find(d => d.idDep === firstMun.idDepMun) || departamentos[0]) : departamentos[0];

      setIdBarAge(firstBar?.idBar || 1);
      setConAge('agente123');
      setAvatarUrl('');

      setSelectedDepId(firstDep ? firstDep.idDep : 1);
      setSelectedMunId(firstMun ? firstMun.idMun : 1);
    }
    setShowAgentModal(true);
  };

  // Filtrar municipios por departamento seleccionado
  const filteredMunicipios = municipios.filter(m => m.idDepMun === selectedDepId);
  // Filtrar barrios por municipio seleccionado
  const filteredBarrios = barrios.filter(b => b.idMunBar === selectedMunId);

  const handleDepChange = (depId: number) => {
    setSelectedDepId(depId);
    const muns = municipios.filter(m => m.idDepMun === depId);
    if (muns.length > 0) {
      const firstMunId = muns[0].idMun;
      setSelectedMunId(firstMunId);
      const bars = barrios.filter(b => b.idMunBar === firstMunId);
      if (bars.length > 0) {
        setIdBarAge(bars[0].idBar);
      } else {
        setIdBarAge(1);
      }
    } else {
      setSelectedMunId(1);
      setIdBarAge(1);
    }
  };

  const handleMunChange = (munId: number) => {
    setSelectedMunId(munId);
    const bars = barrios.filter(b => b.idMunBar === munId);
    if (bars.length > 0) {
      setIdBarAge(bars[0].idBar);
    } else {
      setIdBarAge(1);
    }
  };

  const handleAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idAge.trim() || !nomAge.trim() || !emaAge.trim() || !dirAge.trim() || !telAge.trim() || !conAge.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const agentData: Agente = {
      idAge: idAge.trim(),
      idTipDocAge: Number(idTipDocAge),
      idBarAge: Number(idBarAge),
      nomAge: nomAge.trim(),
      emaAge: emaAge.trim(),
      dirAge: dirAge.trim(),
      telAge: telAge.trim(),
      telAltAge: telAltAge.trim() || undefined,
      conAge: conAge.trim(),
      avatarUrl: avatarUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      conectado: editingAgent ? editingAgent.conectado : false,
      estadoActual: editingAgent ? editingAgent.estadoActual : 'Desconectado'
    };

    if (editingAgent) {
      // Editar perfil existente
      db.updateAgenteProfile(editingAgent.idAge, agentData);
    } else {
      // Validar que no exista el documento
      const exists = agentes.some(a => a.idAge === agentData.idAge);
      if (exists) {
        alert('Ya existe un agente con este número de identificación.');
        return;
      }
      db.addAgente(agentData);
    }

    setAgentes([...db.getAgentes()]);
    setBaseAsesores([...db.getBaseAsesores()]);
    setShowAgentModal(false);
    setEditingAgent(null);
  };

  const handleDeleteAgent = (id: string) => {
    if (confirm('¿Está seguro de eliminar este agente/aprendiz? Se eliminarán también todas sus asignaciones activas a campañas.')) {
      db.deleteAgente(id);
      setAgentes([...db.getAgentes()]);
      setBaseAsesores([...db.getBaseAsesores()]);
    }
  };

  // --- Filtrados ---
  const filteredAsignaciones = baseAsesores.filter((ba) => {
    const agentName = getAgentName(ba.idAgeAse).toLowerCase();
    const doc = ba.idAgeAse.toLowerCase();
    const matchSearch = agentName.includes(searchAsignacion.toLowerCase()) || doc.includes(searchAsignacion.toLowerCase());
    const matchCam = selectedCampanaFilter === 'todas' || ba.codCamAse.toString() === selectedCampanaFilter;
    return matchSearch && matchCam;
  });

  const filteredAgents = agentes.filter((a) => {
    const name = a.nomAge.toLowerCase();
    const doc = a.idAge.toLowerCase();
    const email = a.emaAge.toLowerCase();
    const matchSearch = name.includes(searchAgent.toLowerCase()) || doc.includes(searchAgent.toLowerCase()) || email.includes(searchAgent.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="p-8 space-y-6 animate-fadeIn select-none text-left max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Módulo de Asesores y Aprendices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administra los perfiles de agentes de contact center y sus asignaciones operativas en campañas
          </p>
        </div>

        {/* Sub-tabs de navegación interna */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('gestion_agentes')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'gestion_agentes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gestión de Agentes / Aprendices
          </button>
          <button
            onClick={() => setActiveTab('asignaciones')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'asignaciones' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Asignaciones de Campaña
          </button>
        </div>
      </div>

      {activeTab === 'asignaciones' ? (
        <>
          {/* SECCIÓN ASIGNACIONES A CAMPAÑAS */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar asignación por nombre de asesor o documento..."
                value={searchAsignacion}
                onChange={(e) => setSearchAsignacion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <select
                  value={selectedCampanaFilter}
                  onChange={(e) => setSelectedCampanaFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                >
                  <option value="todas">Todas las campañas</option>
                  {campanas.map(c => (
                    <option key={c.codCam} value={c.codCam}>{c.nomCam}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setEditingAsesor(null);
                  setSelectedAge(agentes[0]?.idAge || '');
                  setSelectedCam(campanas[0]?.codCam || 1);
                  setShowAssignModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all text-xs whitespace-nowrap active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Asignar Campaña
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Documento ID</th>
                    <th className="py-3 px-4">Agente / Aprendiz</th>
                    <th className="py-3 px-4">Campaña Asignada</th>
                    <th className="py-3 px-4 text-center w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredAsignaciones.map((ba, index) => (
                    <tr key={ba.conAse} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{index + 1}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs font-semibold">{ba.idAgeAse}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{getAgentName(ba.idAgeAse)}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-md border border-blue-200">
                          {getCamName(ba.codCamAse)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1">
                        <button
                          onClick={() => handleEditAsignacion(ba)}
                          title="Editar Asignación"
                          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors inline-flex"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveAsignacion(ba.conAse)}
                          title="Eliminar Asignación"
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredAsignaciones.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-medium">
                        No se encontraron registros de asignaciones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* SECCIÓN GESTIÓN DE AGENTES / APRENDICES */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar agente por nombre, documento o correo..."
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <button
              onClick={() => handleOpenAgentModal()}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all text-xs whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Nuevo Agente
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Tipo Doc</th>
                    <th className="py-3 px-4">Identificación</th>
                    <th className="py-3 px-4">Agente / Aprendiz</th>
                    <th className="py-3 px-4">Correo</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4">Dirección</th>
                    <th className="py-3 px-4 text-center w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAgents.map((a) => {
                    const docType = tiposDoc.find(t => t.idTipDoc === a.idTipDocAge)?.nomTipDoc || 'CC';
                    return (
                      <tr key={a.idAge} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-slate-700 font-mono font-bold">{docType}</td>
                        <td className="py-4 px-4 text-slate-700 font-mono font-semibold">{a.idAge}</td>
                        <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <img
                            src={a.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                          <span className="font-bold text-slate-900">{a.nomAge}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-medium">{a.emaAge}</td>
                        <td className="py-4 px-4 text-slate-600 font-mono">
                          {a.telAge} {a.telAltAge && <span className="text-slate-400 text-[10px]">({a.telAltAge})</span>}
                        </td>
                        <td className="py-4 px-4 text-slate-600">{a.dirAge}</td>
                        <td className="py-4 px-4 text-center space-x-1">
                          <button
                            onClick={() => handleOpenAgentModal(a)}
                            title="Editar Datos"
                            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors inline-flex"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(a.idAge)}
                            title="Eliminar Agente"
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredAgents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                        No se encontraron agentes o aprendices registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL NUEVA/EDITAR ASIGNACIÓN */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                {editingAsesor ? 'Editar Asignación de Agente' : 'Nueva Asignación a Campaña'}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setEditingAsesor(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seleccionar Agente *
                </label>
                <select
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Seleccione un agente...</option>
                  {agentes.map(a => (
                    <option key={a.idAge} value={a.idAge}>{a.nomAge}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seleccionar Campaña *
                </label>
                <select
                  value={selectedCam}
                  onChange={(e) => setSelectedCam(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                >
                  {campanas.map(c => (
                    <option key={c.codCam} value={c.codCam}>{c.nomCam}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setEditingAsesor(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-2 rounded-xl shadow-md text-xs"
                >
                  {editingAsesor ? 'Actualizar Asignación' : 'Registrar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR AGENTE (OBLIGATORIOS IGUAL A LA BASE DE DATOS) */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                {editingAgent ? 'Modificar Registro del Agente' : 'Registrar Nuevo Agente / Aprendiz'}
              </h3>
              <button
                onClick={() => {
                  setShowAgentModal(false);
                  setEditingAgent(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAgentSubmit} className="p-6 space-y-4 text-left max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    value={idTipDocAge}
                    onChange={(e) => setIdTipDocAge(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {tiposDoc.map(t => (
                      <option key={t.idTipDoc} value={t.idTipDoc}>{t.nomTipDoc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Número de Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingAgent}
                    placeholder="Ej. 1102345678"
                    value={idAge}
                    onChange={(e) => setIdAge(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nombre y Apellidos del Aprendiz"
                  value={nomAge}
                  onChange={(e) => setNomAge(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={emaAge}
                    onChange={(e) => setEmaAge(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contraseña de Acceso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contraseña del agente"
                    value={conAge}
                    onChange={(e) => setConAge(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono Principal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 3001234567"
                    value={telAge}
                    onChange={(e) => setTelAge(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono Alternativo
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={telAltAge}
                    onChange={(e) => setTelAltAge(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Calle, Carrera, Barrio"
                  value={dirAge}
                  onChange={(e) => setDirAge(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Departamento *
                  </label>
                  <select
                    value={selectedDepId}
                    onChange={(e) => handleDepChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {departamentos.map(d => (
                      <option key={d.idDep} value={d.idDep}>{d.nomDep}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Municipio *
                  </label>
                  <select
                    value={selectedMunId}
                    onChange={(e) => handleMunChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {filteredMunicipios.map(m => (
                      <option key={m.idMun} value={m.idMun}>{m.nomMun}</option>
                    ))}
                    {filteredMunicipios.length === 0 && (
                      <option value="">Seleccione...</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Barrio *
                  </label>
                  <select
                    value={idBarAge}
                    onChange={(e) => setIdBarAge(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {filteredBarrios.map(b => (
                      <option key={b.idBar} value={b.idBar}>{b.nomBar}</option>
                    ))}
                    {filteredBarrios.length === 0 && (
                      <option value="">Seleccione...</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL de Foto de Perfil (Avatar)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (Opcional)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAgentModal(false);
                    setEditingAgent(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md text-xs"
                >
                  {editingAgent ? 'Guardar Cambios' : 'Registrar Agente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
