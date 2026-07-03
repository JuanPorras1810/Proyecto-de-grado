export interface TipoDocumento {
  idTipDoc: number;
  nomTipDoc: string;
}

export interface CanalContacto {
  idCanInt: number;
  nomCanInt: string;
}

export interface EstadoCaso {
  idEstCas: number;
  nomEstCas: string;
}

export interface Departamento {
  idDep: number;
  nomDep: string;
}

export interface Municipio {
  idMun: number;
  idDepMun: number;
  nomMun: string;
}

export interface Barrio {
  idBar: number;
  idMunBar: number;
  nomBar: string;
}

export interface Supervisor {
  idSup: string;
  idTipDocSup: number;
  idBarSup: number;
  nomSup: string;
  emaSup: string;
  dirSup: string;
  telSup: string;
  telAltSup?: string;
  conSup: string;
  avatarUrl?: string;
  conectado?: boolean;
}

export interface Agente {
  idAge: string;
  idTipDocAge: number;
  idBarAge: number;
  nomAge: string;
  emaAge: string;
  dirAge: string;
  telAge: string;
  telAltAge?: string;
  conAge: string;
  avatarUrl?: string;
  conectado?: boolean;
  estadoActual?: 'Disponible' | 'En llamada' | 'En pausa' | 'Desconectado';
}

export interface RegistroSupervisor {
  codRegSup: number;
  idSupRegSup: string;
  fecHoraIniRegSup: string;
  fecHoraCieRegSup?: string;
  tieTotRegSup?: string;
}

export interface RegistroAgente {
  codRegAge: number;
  idAgeRegAge: string;
  fecHoraIniRegAge: string;
  fecHoraCieRegAge?: string;
  tieTotRegAge?: string;
}

export interface CampoPersonalizado {
  id: string;
  nombre: string;
  tipo: 'texto' | 'numero' | 'opciones' | 'fecha';
  opciones?: string[]; // si tipo es opciones
}

export interface Campana {
  codCam: number;
  nomCam: string;
  fecIniCam: string;
  fecFinCam: string;
  proCam?: string; // objetivo / propósito / proveedor de la campaña
  scriptBasico?: string;
  camposPersonalizados?: CampoPersonalizado[];
  activa: boolean;
  protocoloPdfName?: string;
  protocoloPdfData?: string;
}

export interface BaseDatosCliente {
  conCli: number;
  idTipDoCli: number;
  idBarCli?: number;
  codCamCli: number;
  idCli: string;
  nomCli: string;
  emaCli: string;
  dirCli: string;
  telCli: string;
  telAltCli?: string;
  obsCli: string;
  datosAdicionales?: Record<string, any>; // Posibilidad de agregar columnas adicionales según campaña
}

export interface BaseDataAsesor {
  conAse: number;
  idAgeAse: string;
  codCamAse: number;
}

export interface AsignacionLlamada {
  codAsi: number;
  conAseAsi: number;
  conCliAsi: number;
  fecAsi: string;
  conAteAsi: boolean;
}

export interface Tipificacion {
  codTip: number;
  codCamTip: number;
  nomTip: string;
}

export interface Interaccion {
  codInt: number;
  conAseInt: number;
  conCliInt: number;
  codTipInt: number;
  idCanInt: number;
  idEstCasInt: number; // 1: Abierto, 2: Cerrado/Resuelto, 3: Escalado
  motInt: string;
  fecInt: string;
  horIniInt: string;
  horFinInt: string;
  tieProInt: string; // tiempo de atención (p. ej. "05m 20s")
  obsInt: string;
  resultado?: string;
}

export interface Caso {
  codCas: number;
  codIntCas: number;
  comIntCas: string;
  fecIniCas: string;
  fecCieCas?: string;
  estado: 'Abierto' | 'Cerrado' | 'Escalado';
  agenteAsignado?: string;
}

export interface UserSession {
  role: 'supervisor' | 'agente';
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl: string;
  codRegistro: number;
  horaInicio: string;
}
