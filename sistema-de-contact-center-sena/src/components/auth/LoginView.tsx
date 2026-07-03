import React, { useState } from 'react';
import { DBController } from '../../controllers/dbController';
import { AuthController } from '../../controllers/authController';
import { UserSession } from '../../types/db';
import { Headphones, ShieldCheck, UserCheck, Lock, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<'supervisor' | 'agente'>('supervisor');
  
  const [documentNumber, setDocumentNumber] = useState('1098765432');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleRoleChange = (newRole: 'supervisor' | 'agente') => {
    setRole(newRole);
    if (newRole === 'supervisor') {
      setDocumentNumber('1098765432');
      setPassword('admin123');
    } else {
      setDocumentNumber('1102345678');
      setPassword('agente123');
    }
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentNumber.trim()) {
      setError('Por favor digite su número de documento');
      return;
    }
    if (!password.trim()) {
      setError('Por favor digite su contraseña');
      return;
    }
    try {
      const session = AuthController.login(role, documentNumber.trim(), password.trim());
      onLoginSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Luces de fondo ambientación Contact Center */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl p-8 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-4 text-blue-400">
            <Headphones className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sistema de Contact Center SENA</h1>
          <p className="text-slate-400 text-sm mt-1">Plataforma operativa de gestión, tipificación y reportes</p>
        </div>

        {/* Requerimiento explícito: Elige si es Supervisor o Agente */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleRoleChange('supervisor')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              role === 'supervisor'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Supervisor
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('agente')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              role === 'agente'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Agente
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Número de Documento ({role === 'supervisor' ? 'idSup' : 'idAge'})
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder={role === 'supervisor' ? 'Ej. 1098765432' : 'Ej. 1102345678'}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {role === 'supervisor' 
                ? 'Pista Supervisor: 1098765432 (clave: admin123) o 9876543210 (clave: super123)' 
                : 'Pista Agente: 1102345678 (clave: agente123) o 1098112233 (clave: agente123)'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contraseña ({role === 'supervisor' ? 'conSup' : 'conAge'})
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all group mt-3"
          >
            <span>Iniciar Sesión en el Sistema</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
          <p className="text-xs text-slate-500">
            Base de datos activa: <span className="text-blue-400 font-mono">contactSena</span>
          </p>
        </div>
      </div>
    </div>
  );
};
