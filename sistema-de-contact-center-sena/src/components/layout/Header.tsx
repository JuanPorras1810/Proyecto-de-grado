import React from 'react';
import { UserSession } from '../../types/db';
import { ShieldCheck, UserCheck, HelpCircle } from 'lucide-react';

interface HeaderProps {
  session: UserSession;
  onSwitchRole: (newRole: 'supervisor' | 'agente') => void;
}

export const Header: React.FC<HeaderProps> = ({ session, onSwitchRole }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between select-none">
      <div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Sistema Operativo de Contact Center</h1>
        <p className="text-xs text-slate-500">Plataforma SENA de gestión operativa, capacitación y tipificación de contactos</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 pl-2">Vista activa:</span>
          <select
            value={session.role}
            onChange={(e) => onSwitchRole(e.target.value as any)}
            className="bg-white border border-slate-300 font-bold text-xs rounded-lg px-3 py-1.5 text-slate-800 shadow-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="supervisor">Supervisor del Equipo</option>
            <option value="agente">Aprendiz / Agente</option>
          </select>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors title='Ayuda interactiva'">
          <HelpCircle className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
