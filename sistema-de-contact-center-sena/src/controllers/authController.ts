import { UserSession, Agente, Supervisor } from '../types/db';
import { DBController } from './dbController';

const SESSION_KEY = 'CONTACT_SENA_ACTIVE_SESSION_v1';

export class AuthController {
  public static getSession(): UserSession | null {
    const s = sessionStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  }

  public static login(role: 'supervisor' | 'agente', userId: string, password?: string): UserSession {
    const db = DBController.getInstance();
    let name = '';
    let email = '';
    let avatar = '';

    if (role === 'agente') {
      const a: Agente | undefined = db.getAgentes().find(ag => ag.idAge === userId);
      if (!a) throw new Error('No se encontró ningún Agente con el documento ' + userId);
      if (password && a.conAge !== password) {
        throw new Error('Contraseña incorrecta para el Agente ' + userId);
      }
      name = a.nomAge;
      email = a.emaAge;
      avatar = a.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    } else {
      const s: Supervisor | undefined = db.getSupervisores().find(sup => sup.idSup === userId);
      if (!s) throw new Error('No se encontró ningún Supervisor con el documento ' + userId);
      if (password && s.conSup !== password) {
        throw new Error('Contraseña incorrecta para el Supervisor ' + userId);
      }
      name = s.nomSup;
      email = s.emaSup;
      avatar = s.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80';
    }

    const codReg = db.registrarInicioSesion(userId, role);

    const session: UserSession = {
      role,
      userId,
      userName: name,
      userEmail: email,
      avatarUrl: avatar,
      codRegistro: codReg,
      horaInicio: new Date().toISOString()
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  public static logout(): void {
    const s = this.getSession();
    if (s) {
      const db = DBController.getInstance();
      db.registrarCierreSesion(s.codRegistro, s.userId, s.role);
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  public static updateSessionData(
    userName: string,
    userEmail: string,
    avatarUrl: string,
    additionalFields: {
      idBar?: number;
      dir?: string;
      tel?: string;
      telAlt?: string;
    }
  ): UserSession | null {
    const s = this.getSession();
    if (!s) return null;

    const db = DBController.getInstance();
    if (s.role === 'agente') {
      db.updateAgenteProfile(s.userId, {
        nomAge: userName,
        emaAge: userEmail,
        avatarUrl,
        idBarAge: additionalFields.idBar,
        dirAge: additionalFields.dir,
        telAge: additionalFields.tel,
        telAltAge: additionalFields.telAlt
      });
    } else {
      db.updateSupervisorProfile(s.userId, {
        nomSup: userName,
        emaSup: userEmail,
        avatarUrl,
        idBarSup: additionalFields.idBar,
        dirSup: additionalFields.dir,
        telSup: additionalFields.tel,
        telAltSup: additionalFields.telAlt
      });
    }

    const updated: UserSession = { ...s, userName, userEmail, avatarUrl };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    return updated;
  }
}
