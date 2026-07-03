import React from 'react';
import { UserSession } from '../../types/db';
import { UserDropdown } from './UserDropdown';
import {
  LayoutDashboard,
  Users,
  Database,
  Target,
  PhoneCall,
  Ticket,
  BarChart3,
  Clock,
  History,
  Headphones,
  FileSpreadsheet
} from 'lucide-react';

interface SidebarProps {
  session: UserSession;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSessionUpdated: (updated: UserSession) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  session,
  activeTab,
  setActiveTab,
  onLogout,
  onSessionUpdated
}) => {
  const isSupervisor = session.role === 'supervisor';

  const supervisorMenu = [
    { id: 'panel_supervisor', label: 'Panel Supervisor', icon: LayoutDashboard, badge: 'Hub' },
    { id: 'asesores_campana', label: 'Asesores', icon: Users },
    { id: 'clientes', label: 'Clientes', icon: Database }, // Requerimiento: Renombrar a "Clientes"
    { id: 'campanas', label: 'Campañas', icon: Target },
    { id: 'indicadores', label: 'Indicadores', icon: BarChart3 },
    { id: 'registro_tiempos', label: 'Registro de Tiempos', icon: Clock },
    { id: 'historial_gestiones', label: 'Historial Gestiones', icon: History },
  ];

  const agenteMenu = [
    { id: 'agente_contactos', label: 'Módulo Contactos', icon: PhoneCall, badge: 'Operar' },
    { id: 'agente_tickets', label: 'Mis Tickets', icon: Ticket },
    { id: 'agente_tiempo', label: 'Mi Tiempo', icon: Clock },
    { id: 'agente_historial', label: 'Mi Historial', icon: History },
  ];

  const menuItems = isSupervisor ? supervisorMenu : agenteMenu;

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 select-none">
      {/* Encabezado Logo SENA Contact */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
          <Headphones className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-white text-base tracking-tight leading-none">Contact Center</h2>
          <span className="text-xs text-blue-400 font-medium">Panel {isSupervisor ? 'Supervisor' : 'Agente'}</span>
        </div>
      </div>

      {/* Navegación Principal */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Módulos Operativos</p>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isActive ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer con el componente requerido de Usuario Actual y opciones */}
      <UserDropdown session={session} onLogout={onLogout} onSessionUpdated={onSessionUpdated} />
    </aside>
  );
};
