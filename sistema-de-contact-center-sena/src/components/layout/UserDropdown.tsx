import React, { useState, useRef, useEffect } from 'react';
import { UserSession } from '../../types/db';
import { AuthController } from '../../controllers/authController';
import { ProfileModal } from '../auth/ProfileModal';
import { UserCog, LogOut, ChevronUp } from 'lucide-react';

interface UserDropdownProps {
  session: UserSession;
  onLogout: () => void;
  onSessionUpdated: (updated: UserSession) => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ session, onLogout, onSessionUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    AuthController.logout();
    onLogout();
  };

  return (
    <div className="relative p-3 border-t border-slate-800 bg-slate-950/80" ref={dropdownRef}>
      {/* Menú flotante de opciones */}
      {isOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-fadeIn">
          <button
            onClick={() => {
              setIsOpen(false);
              setShowProfileModal(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-blue-600/20 hover:text-blue-400 transition-colors text-left"
          >
            <UserCog className="w-4 h-4 text-blue-400" />
            <div className="flex-1">
              <p className="font-semibold">Actualizar Datos</p>
              <p className="text-[11px] text-slate-400">Modificar foto, nombre y correo</p>
            </div>
          </button>
          
          <div className="h-px bg-slate-700/60 my-1 mx-2"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <div className="flex-1">
              <p className="font-semibold">Cerrar Sesión</p>
              <p className="text-[11px] text-slate-400">Volver a la selección de rol</p>
            </div>
          </button>
        </div>
      )}

      {/* Botón principal exigido: Círculo con foto al frente del nombre */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/80 transition-colors group text-left"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Círculo con foto */}
          <div className="relative flex-shrink-0">
            <img
              src={session.avatarUrl}
              alt={session.userName}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-md bg-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full"></span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Usuario actual</p>
            <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
              {session.userName}
            </p>
          </div>
        </div>

        <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Modal de Actualización */}
      {showProfileModal && (
        <ProfileModal
          session={session}
          onClose={() => setShowProfileModal(false)}
          onUpdateSuccess={onSessionUpdated}
        />
      )}
    </div>
  );
};
