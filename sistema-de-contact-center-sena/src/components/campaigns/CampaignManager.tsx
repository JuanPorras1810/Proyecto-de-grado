import React, { useState } from 'react';
import { DBController } from '../../controllers/dbController';
import { Campana } from '../../types/db';
import { Plus, Edit2, Pause, Play, Target, Check, X, FileText, Upload, Download, Eye, Trash2, Search } from 'lucide-react';

const DEFAULT_TIPIFICACIONES = ['Contestó', 'No contesta', 'Volver a llamar', 'Ocupado', 'Equivocado', 'Buzón de voz'];

export const CampaignManager: React.FC = () => {
  const db = DBController.getInstance();
  const [campanas, setCampanas] = useState<Campana[]>(db.getCampanas());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCam, setEditingCam] = useState<Campana | null>(null);

  // Estados de filtros y búsquedas
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Form states
  const [nomCam, setNomCam] = useState('');
  const [fecIniCam, setFecIniCam] = useState('');
  const [fecFinCam, setFecFinCam] = useState('');
  const [proCam, setProCam] = useState(''); // Proveedor de la Campaña
  const [protocoloPdfName, setProtocoloPdfName] = useState('');
  const [protocoloPdfData, setProtocoloPdfData] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Tipificaciones obligatorias en formulario
  const [selectedTips, setSelectedTips] = useState<string[]>(['Contestó', 'No contesta', 'Volver a llamar']);
  const [customTip, setCustomTip] = useState('');
  const [formError, setFormError] = useState('');

  // PDF Preview Modal state
  const [previewingCam, setPreviewingCam] = useState<Campana | null>(null);

  const handleOpenModal = (cam?: Campana) => {
    if (cam) {
      setEditingCam(cam);
      setNomCam(cam.nomCam);
      setFecIniCam(cam.fecIniCam);
      setFecFinCam(cam.fecFinCam);
      setProCam(cam.proCam || '');
      setProtocoloPdfName(cam.protocoloPdfName || '');
      setProtocoloPdfData(cam.protocoloPdfData || '');

      // Cargar tipificaciones existentes de esta campaña
      const existingTips = db.getTipificaciones()
        .filter(t => t.codCamTip === cam.codCam)
        .map(t => t.nomTip);
      setSelectedTips(existingTips.length > 0 ? existingTips : ['Contestó', 'No contesta', 'Volver a llamar']);
    } else {
      setEditingCam(null);
      setNomCam('');
      setFecIniCam(new Date().toISOString().split('T')[0]);
      setFecFinCam('2026-12-31');
      setProCam('');
      setProtocoloPdfName('');
      setProtocoloPdfData('');
      setSelectedTips(['Contestó', 'No contesta', 'Volver a llamar']);
    }
    setCustomTip('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Por favor suba únicamente un archivo en formato PDF.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProtocoloPdfName(file.name);
      setProtocoloPdfData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFileInForm = () => {
    setProtocoloPdfName('');
    setProtocoloPdfData('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (selectedTips.length === 0) {
      setFormError('Debe definir o seleccionar al menos una tipificación obligatoria para la campaña.');
      return;
    }

    if (editingCam) {
      const updated: Campana = {
        ...editingCam,
        nomCam,
        fecIniCam,
        fecFinCam,
        proCam,
        protocoloPdfName,
        protocoloPdfData,
      };
      db.updateCampana(updated);
      db.saveTipificacionesParaCampana(editingCam.codCam, selectedTips);
    } else {
      const newCam = db.addCampana({
        nomCam,
        fecIniCam,
        fecFinCam,
        proCam,
        protocoloPdfName,
        protocoloPdfData,
        activa: true
      });
      db.saveTipificacionesParaCampana(newCam.codCam, selectedTips);
    }
    setCampanas([...db.getCampanas()]);
    setIsModalOpen(false);
  };

  const handleToggleActive = (cam: Campana) => {
    cam.activa = !cam.activa;
    db.updateCampana(cam);
    setCampanas([...db.getCampanas()]);
  };

  const triggerDownload = (cam: Campana) => {
    if (!cam.protocoloPdfData) return;
    const link = document.createElement('a');
    link.href = cam.protocoloPdfData;
    link.download = cam.protocoloPdfName || 'protocolo.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCampanas = campanas.filter((cam) => {
    // Filtro por fecha de inicio (mayor o igual que fechaInicio si se define)
    if (fechaInicio && cam.fecIniCam < fechaInicio) {
      return false;
    }
    // Filtro por fecha de fin (menor o igual que fechaFin si se define)
    if (fechaFin && cam.fecFinCam > fechaFin) {
      return false;
    }
    // Búsqueda por palabra clave en nombre o script básico
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNom = cam.nomCam.toLowerCase().includes(q);
      const matchScript = cam.scriptBasico?.toLowerCase().includes(q);
      const matchPdf = cam.protocoloPdfName?.toLowerCase().includes(q);
      if (!matchNom && !matchScript && !matchPdf) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6 animate-fadeIn select-none text-left max-w-7xl mx-auto">
      {/* Encabezado Gestión de Campañas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Campañas</h2>
          <p className="text-xs text-slate-500 mt-1">Crea y administra tus campañas de contacto y protocolos de atención</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nueva Campaña
        </button>
      </div>

      {/* Contenedor de Búsqueda y Filtros con diseño idéntico al de la imagen */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-end gap-5">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">Fecha de Inicio Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">Fecha de Fin Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Buscador de texto secundario */}
        <div className="relative w-full md:w-80">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">Palabra Clave</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por nombre o protocolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        {(fechaInicio || fechaFin || searchTerm) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFechaInicio('');
              setFechaFin('');
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors h-[42px] flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Listado de Campañas */}
      <div className="space-y-4">
        {filteredCampanas.map((cam) => (
          <div key={cam.codCam} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">{cam.nomCam}</h3>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  cam.activa ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cam.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(cam)}
                  title="Editar Campaña"
                  className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleActive(cam)}
                  className={`p-2 rounded-xl transition-colors ${
                    cam.activa ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={cam.activa ? 'Pausar Campaña' : 'Activar Campaña'}
                >
                  {cam.activa ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Vigencia y Fechas:</span>
                <p className="text-slate-700 font-mono font-semibold">Inicio: {cam.fecIniCam} / Fin: {cam.fecFinCam}</p>
              </div>
            </div>

            {/* Protocolo de atención en PDF */}
            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block mb-2">Protocolo de Atención (PDF):</span>
              {cam.protocoloPdfName ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-md">{cam.protocoloPdfName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Archivo PDF Cargado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setPreviewingCam(cam)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Protocolo</span>
                    </button>
                    <button
                      onClick={() => triggerDownload(cam)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all border border-blue-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No se ha cargado un protocolo de atención en PDF para esta campaña. Edite la campaña para cargar uno.</p>
              )}
            </div>
          </div>
        ))}

        {filteredCampanas.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm font-medium">
            {campanas.length === 0
              ? 'No hay campañas operativas registradas en la base de datos. Crea una haciendo clic en "Nueva Campaña".'
              : 'No se encontraron campañas que coincidan con los criterios de búsqueda seleccionados.'}
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Campaña */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-fadeIn my-8 text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2 tracking-tight">
                <Target className="w-5 h-5 text-blue-600" />
                {editingCam ? 'Configurar Campaña Existente' : 'Crear Nueva Campaña Operativa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nombre de la Campaña *</label>
                <input
                  type="text"
                  required
                  value={nomCam}
                  onChange={(e) => setNomCam(e.target.value)}
                  placeholder="Ej. Fidelización SENA 2026"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={fecIniCam}
                    onChange={(e) => setFecIniCam(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fecha de Fin *</label>
                  <input
                    type="date"
                    required
                    value={fecFinCam}
                    onChange={(e) => setFecFinCam(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sección de Tipificaciones Obligatorias */}
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tipificaciones Operativas Requeridas *
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    Asigne las opciones de respuesta que el agente tendrá disponibles para registrar interacciones.
                  </p>
                </div>

                {/* Predeterminadas (Más usadas) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Predefinidas Comunes:</span>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_TIPIFICACIONES.map((tip) => {
                      const isSelected = selectedTips.includes(tip);
                      return (
                        <button
                          key={tip}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTips(selectedTips.filter((t) => t !== tip));
                            } else {
                              setSelectedTips([...selectedTips, tip]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          {tip}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Agregar Nuevas Tipificaciones */}
                <div className="space-y-2 pt-2 border-t border-slate-200/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Agregar Tipificación Personalizada:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      placeholder="Escriba otra tipificación... Ej. Contestó, No contesta, Ocupado"
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = customTip.trim();
                          if (val && !selectedTips.includes(val)) {
                            setSelectedTips([...selectedTips, val]);
                            setCustomTip('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = customTip.trim();
                        if (val && !selectedTips.includes(val)) {
                          setSelectedTips([...selectedTips, val]);
                          setCustomTip('');
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>

                {/* Listar Personalizadas seleccionadas */}
                {selectedTips.filter((tip) => !DEFAULT_TIPIFICACIONES.includes(tip)).length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Personalizadas Creadas:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTips
                        .filter((tip) => !DEFAULT_TIPIFICACIONES.includes(tip))
                        .map((tip) => (
                          <span
                            key={tip}
                            className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                          >
                            {tip}
                            <button
                              type="button"
                              onClick={() => setSelectedTips(selectedTips.filter((t) => t !== tip))}
                              className="text-purple-400 hover:text-purple-600 p-0.5 rounded-full hover:bg-purple-100/50 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Área para subir PDF con el protocolo de atención */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Protocolo de Atención en PDF *</label>
                
                {protocoloPdfName ? (
                  <div className="flex items-center justify-between border border-emerald-200 bg-emerald-50/50 rounded-xl p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-950 truncate max-w-sm">{protocoloPdfName}</p>
                        <p className="text-[10px] text-emerald-600 font-bold">Protocolo PDF listo para guardar</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFileInForm}
                      title="Eliminar archivo"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                    onClick={() => document.getElementById('protocolo-file-input')?.click()}
                  >
                    <input
                      id="protocolo-file-input"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Arrastra y suelta tu archivo PDF aquí</p>
                    <p className="text-[10px] text-slate-400 mt-1">O haz clic para seleccionar un archivo PDF de tu dispositivo</p>
                  </div>
                )}
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-xs flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar Campaña</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Mockup Preview Modal */}
      {previewingCam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-100 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-fadeIn border border-slate-200 text-left flex flex-col h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500 fill-red-500/20" />
                <div>
                  <h3 className="text-sm font-black tracking-tight">Visor de Protocolo: {previewingCam.nomCam}</h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-lg">{previewingCam.protocoloPdfName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => triggerDownload(previewingCam)}
                  className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </button>
                <button
                  onClick={() => setPreviewingCam(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-300/80 custom-scrollbar flex justify-center">
              <div className="bg-white w-full max-w-2xl min-h-[700px] shadow-lg rounded-sm p-12 border border-slate-300 relative text-slate-800 select-text flex flex-col justify-between">
                <div>
                  {/* Document Header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-8">
                    <div>
                      <h4 className="text-lg font-black tracking-tight text-slate-900 uppercase">SENA Telecom Contact Center</h4>
                      <p className="text-xs text-slate-500 font-mono">SISTEMA INTEGRADO DE GESTIÓN OPERATIVA (SIGO)</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        REPOSITORIO-SENA-2026
                      </span>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="space-y-2 mb-8">
                    <h1 className="text-2xl font-black text-slate-900 leading-tight uppercase">Protocolo Operativo de Atención</h1>
                    <p className="text-xs text-slate-400 font-mono">Campaña: <span className="text-slate-800 font-bold font-sans">{previewingCam.nomCam}</span></p>
                    <p className="text-xs text-slate-400 font-mono">Vigencia: <span className="text-slate-800 font-bold font-sans">{previewingCam.fecIniCam} hasta {previewingCam.fecFinCam}</span></p>
                  </div>

                  {/* Document Body */}
                  <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">1. Declaración de Misión Operativa</h2>
                      <p>El presente documento constituye el marco formal de actuación y protocolo del Contact Center SENA Telecom para la gestión integrada de la campaña activa.</p>
                      <p className="mt-2">Todos los agentes asignados y aprendices operativos deberán cumplir a cabalidad las normas y lineamientos descritos en las secciones subsiguientes para mantener los estándares CSAT y calidad en el servicio.</p>
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">2. Etapas del Saludo e Identificación</h2>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li><strong>Saludo Corporativo:</strong> Iniciar la interacción con voz clara y neutral: "Buenos días/tardes. Le saluda [Nombre del Agente] de Contact Center SENA Telecom."</li>
                        <li><strong>Verificación de Datos:</strong> Solicitar y verificar el tipo y número de documento del cliente titular antes de brindar información confidencial.</li>
                        <li><strong>Escucha Activa:</strong> Permitir al cliente exponer el motivo de su llamada o chat sin interrupciones durante los primeros 45 segundos.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">3. Tipificación y Cierre Obligatorio</h2>
                      <p>Cada llamada finalizada debe ser registrada y tipificada de forma obligatoria. El agente cuenta con un tiempo post-llamada (ACW) de hasta 40 segundos para registrar las observaciones detalladas en el módulo de interacciones.</p>
                      <p className="mt-2"><strong>Nota de Negocio:</strong> Si el caso queda clasificado en estado "Abierto" o "Escalado", se debe generar y diligenciar íntegramente el Ticket de Caso/PQR correspondiente antes de cerrar la interacción.</p>
                    </div>
                  </div>
                </div>

                {/* Document Footer */}
                <div className="border-t border-slate-200 pt-4 mt-8 flex justify-between text-[10px] font-mono text-slate-400">
                  <span>© 2026 Servicio Nacional de Aprendizaje - SENA</span>
                  <span>Página 1 de 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
