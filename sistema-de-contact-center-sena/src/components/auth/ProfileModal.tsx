import React, { useState } from 'react';
import { UserSession } from '../../types/db';
import { AuthController } from '../../controllers/authController';
import { DBController } from '../../controllers/dbController';
import { X, Save, Camera, User, Mail, MapPin, Phone, PhoneCall } from 'lucide-react';

interface ProfileModalProps {
  session: UserSession;
  onClose: () => void;
  onUpdateSuccess: (updatedSession: UserSession) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ session, onClose, onUpdateSuccess }) => {
  const db = DBController.getInstance();
  const geo = db.getGeografia();
  const departamentos = geo.departamentos || [];
  const municipios = geo.municipios || [];
  const barrios = geo.barrios || [];

  // Buscar datos actuales específicos en la base de datos para pre-llenar todos los campos requeridos
  let initialIdBar = 1;
  let initialDir = '';
  let initialTel = '';
  let initialTelAlt = '';

  if (session.role === 'agente') {
    const ag = db.getAgentes().find(a => a.idAge === session.userId);
    if (ag) {
      initialIdBar = ag.idBarAge || 1;
      initialDir = ag.dirAge || '';
      initialTel = ag.telAge || '';
      initialTelAlt = ag.telAltAge || '';
    }
  } else {
    const sup = db.getSupervisores().find(s => s.idSup === session.userId);
    if (sup) {
      initialIdBar = sup.idBarSup || 1;
      initialDir = sup.dirSup || '';
      initialTel = sup.telSup || '';
      initialTelAlt = sup.telAltSup || '';
    }
  }

  // Encontrar el barrio, municipio y departamento iniciales correspondientes a initialIdBar
  const currentBarrio = barrios.find(b => b.idBar === initialIdBar) || barrios[0];
  const currentMunicipio = currentBarrio ? (municipios.find(m => m.idMun === currentBarrio.idMunBar) || municipios[0]) : municipios[0];
  const currentDepartamento = currentMunicipio ? (departamentos.find(d => d.idDep === currentMunicipio.idDepMun) || departamentos[0]) : departamentos[0];

  const [name, setName] = useState(session.userName);
  const [email, setEmail] = useState(session.userEmail);
  const [avatarUrl, setAvatarUrl] = useState(session.avatarUrl);
  
  // Estados para cascada geográfica
  const [selectedDepId, setSelectedDepId] = useState<number>(currentDepartamento ? currentDepartamento.idDep : 1);
  const [selectedMunId, setSelectedMunId] = useState<number>(currentMunicipio ? currentMunicipio.idMun : 1);
  const [idBar, setIdBar] = useState<number>(initialIdBar);

  const [dir, setDir] = useState(initialDir);
  const [tel, setTel] = useState(initialTel);
  const [telAlt, setTelAlt] = useState(initialTelAlt);
  const [loading, setLoading] = useState(false);

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
        setIdBar(bars[0].idBar);
      } else {
        setIdBar(1);
      }
    } else {
      setSelectedMunId(1);
      setIdBar(1);
    }
  };

  const handleMunChange = (munId: number) => {
    setSelectedMunId(munId);
    const bars = barrios.filter(b => b.idMunBar === munId);
    if (bars.length > 0) {
      setIdBar(bars[0].idBar);
    } else {
      setIdBar(1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !dir.trim() || !tel.trim() || !idBar) {
      alert('Por favor complete todos los campos requeridos (*)');
      return;
    }
    setLoading(true);
    
    const updated = AuthController.updateSessionData(name, email, avatarUrl, {
      idBar,
      dir,
      tel,
      telAlt: telAlt.trim() || undefined
    });
    
    setLoading(false);
    if (updated) {
      onUpdateSuccess(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-fadeIn text-left">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Actualizar Datos de {session.role === 'supervisor' ? 'Supervisor' : 'Agente'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Foto de Perfil y Vista Previa */}
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/30 shadow-xl bg-slate-900"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xs text-slate-400 mt-2">Vista previa de tu foto de perfil</span>
          </div>

          {/* Fila 1: URL Foto de Perfil */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              URL de Foto de Perfil (Avatar) *
            </label>
            <div className="relative">
              <Camera className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fila 2: Nombre Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Fila 2: Correo Electrónico */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  maxLength={100}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="correo@sena.edu.co"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Fila 3: Departamento */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Departamento *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <select
                  value={selectedDepId}
                  onChange={(e) => handleDepChange(Number(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {departamentos.map(d => (
                    <option key={d.idDep} value={d.idDep}>{d.nomDep}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 4: Municipio */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Municipio *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <select
                  value={selectedMunId}
                  onChange={(e) => handleMunChange(Number(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {filteredMunicipios.map(m => (
                    <option key={m.idMun} value={m.idMun}>{m.nomMun}</option>
                  ))}
                  {filteredMunicipios.length === 0 && (
                    <option value="">Seleccione un Municipio</option>
                  )}
                </select>
              </div>
            </div>

            {/* Fila 5: Barrio Residencial */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Barrio Residencial *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <select
                  value={idBar}
                  onChange={(e) => setIdBar(Number(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {filteredBarrios.map(b => (
                    <option key={b.idBar} value={b.idBar}>{b.nomBar}</option>
                  ))}
                  {filteredBarrios.length === 0 && (
                    <option value="">Seleccione un Barrio</option>
                  )}
                </select>
              </div>
            </div>

            {/* Fila 3: Dirección */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Dirección Residencial *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={60}
                  value={dir}
                  onChange={(e) => setDir(e.target.value)}
                  required
                  placeholder="Ej. Calle 100 # 20-30"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Fila 4: Teléfono Principal */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Teléfono Principal *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={10}
                  value={tel}
                  onChange={(e) => setTel(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="Ej. 3001234567"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Fila 4: Teléfono Alternativo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Teléfono Alternativo (Opcional)
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={10}
                  value={telAlt}
                  onChange={(e) => setTelAlt(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej. 3159876543"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
