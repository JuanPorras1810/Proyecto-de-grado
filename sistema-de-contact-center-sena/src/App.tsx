/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserSession } from './types/db';
import { AuthController } from './controllers/authController';
import { DBController } from './controllers/dbController';

// Componentes
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { AsesoresCampana } from './components/campaigns/AsesoresCampana';
import { ClientsManager } from './components/clients/ClientsManager';
import { CampaignManager } from './components/campaigns/CampaignManager';
import { TicketsManager } from './components/tickets/TicketsManager';
import { IndicatorsView } from './components/reports/IndicatorsView';
import { TimeRegistryView } from './components/reports/TimeRegistryView';
import { HistoryView } from './components/reports/HistoryView';

import { AgentContactsView } from './components/agent/AgentContactsView';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => AuthController.getSession());
  const [activeTab, setActiveTab] = useState<string>('panel_supervisor');

  // Inicializar base de datos
  useEffect(() => {
    DBController.getInstance();
  }, []);

  // Sincronizar pestaña activa inicial al cambiar rol
  useEffect(() => {
    if (session) {
      if (session.role === 'supervisor') {
        setActiveTab('panel_supervisor');
      } else {
        setActiveTab('agente_contactos');
      }
    }
  }, [session?.role]);

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    setSession(null);
  };

  const handleSwitchRole = (newRole: 'supervisor' | 'agente') => {
    if (!session) return;
    const db = DBController.getInstance();
    let name = session.userName;
    let email = session.userEmail;
    let avatar = session.avatarUrl;
    let userId = session.userId;

    // Si cambiamos de rol en la barra de demostración, buscamos cuenta del otro rol
    if (newRole === 'supervisor') {
      const sup = db.getSupervisores()[0];
      if (sup) {
        userId = sup.idSup;
        name = sup.nomSup;
        email = sup.emaSup;
        avatar = sup.avatarUrl || avatar;
      }
    } else {
      const age = db.getAgentes()[0];
      if (age) {
        userId = age.idAge;
        name = age.nomAge;
        email = age.emaAge;
        avatar = age.avatarUrl || avatar;
      }
    }

    const updatedSession: UserSession = {
      ...session,
      role: newRole,
      userId,
      userName: name,
      userEmail: email,
      avatarUrl: avatar
    };
    sessionStorage.setItem('CONTACT_SENA_ACTIVE_SESSION_v1', JSON.stringify(updatedSession));
    setSession(updatedSession);
  };

  if (!session) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    if (session.role === 'supervisor') {
      switch (activeTab) {
        case 'panel_supervisor':
          return <SupervisorDashboard onNavigate={setActiveTab} />;
        case 'asesores_campana':
          return <AsesoresCampana />;
        case 'clientes':
          return <ClientsManager />;
        case 'campanas':
          return <CampaignManager />;
        case 'tickets':
          return <TicketsManager />;
        case 'indicadores':
          return <IndicatorsView session={session} />;
        case 'registro_tiempos':
          return <TimeRegistryView session={session} />;
        case 'historial_gestiones':
          return <HistoryView session={session} />;
        default:
          return <SupervisorDashboard />;
      }
    } else {
      // Vistas Agente
      switch (activeTab) {
        case 'agente_contactos':
          return <AgentContactsView session={session} />;
        case 'agente_tickets':
          return <TicketsManager />;
        case 'agente_tiempo':
          return <TimeRegistryView session={session} />;
        case 'agente_historial':
          return <HistoryView session={session} />;
        default:
          return <AgentContactsView session={session} />;
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800 select-none">
      <Sidebar
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onSessionUpdated={(updated) => setSession(updated)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header session={session} onSwitchRole={handleSwitchRole} />

        <main className="flex-1 overflow-y-auto bg-slate-100/70 custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
