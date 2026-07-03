import {
  TipoDocumento,
  CanalContacto,
  EstadoCaso,
  Departamento,
  Municipio,
  Barrio,
  Supervisor,
  Agente,
  Campana,
  BaseDatosCliente,
  Tipificacion,
  Interaccion,
  Caso,
  BaseDataAsesor,
  RegistroAgente,
  RegistroSupervisor
} from '../types/db';

import {
  SEED_TIPO_DOCUMENTO,
  SEED_CANAL_CONTACTO,
  SEED_ESTADO_CASO,
  SEED_DEPARTAMENTO,
  SEED_MUNICIPIO,
  SEED_BARRIO,
  SEED_SUPERVISORES,
  SEED_AGENTES,
  SEED_CAMPANAS,
  SEED_BASE_ASESOR,
  SEED_TIPIFICACION,
  SEED_CLIENTES,
  SEED_INTERACCIONES,
  SEED_CASOS
} from '../data/mockDatabase';

const STORAGE_KEY = 'CONTACT_SENA_SIMULATOR_DB_v1';

interface DatabaseState {
  tipoDocumento: TipoDocumento[];
  canalContacto: CanalContacto[];
  estadoCaso: EstadoCaso[];
  departamento: Departamento[];
  municipio: Municipio[];
  barrio: Barrio[];
  supervisores: Supervisor[];
  agentes: Agente[];
  campanas: Campana[];
  baseAsesores: BaseDataAsesor[];
  tipificaciones: Tipificacion[];
  clientes: BaseDatosCliente[];
  interacciones: Interaccion[];
  casos: Caso[];
  registroAgentes: RegistroAgente[];
  registroSupervisores: RegistroSupervisor[];
}

export class DBController {
  private static instance: DBController;
  private db: DatabaseState;

  private constructor() {
    this.db = this.loadDB();
  }

  public static getInstance(): DBController {
    if (!DBController.instance) {
      DBController.instance = new DBController();
    }
    return DBController.instance;
  }

  private loadDB(): DatabaseState {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parseando base de datos guardada, cargando semilla', e);
      }
    }
    const initial: DatabaseState = {
      tipoDocumento: SEED_TIPO_DOCUMENTO,
      canalContacto: SEED_CANAL_CONTACTO,
      estadoCaso: SEED_ESTADO_CASO,
      departamento: SEED_DEPARTAMENTO,
      municipio: SEED_MUNICIPIO,
      barrio: SEED_BARRIO,
      supervisores: SEED_SUPERVISORES,
      agentes: SEED_AGENTES,
      campanas: SEED_CAMPANAS,
      baseAsesores: SEED_BASE_ASESOR,
      tipificaciones: SEED_TIPIFICACION,
      clientes: SEED_CLIENTES,
      interacciones: SEED_INTERACCIONES,
      casos: SEED_CASOS,
      registroAgentes: [],
      registroSupervisores: []
    };
    this.saveDB(initial);
    return initial;
  }

  private saveDB(state?: DatabaseState) {
    if (state) this.db = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  public resetDB() {
    localStorage.removeItem(STORAGE_KEY);
    this.db = this.loadDB();
  }

  // --- GETTERS ---
  public getConfigTablas() {
    return {
      tiposDoc: this.db.tipoDocumento,
      canales: this.db.canalContacto,
      estados: this.db.estadoCaso
    };
  }

  public getGeografia() {
    return {
      departamentos: this.db.departamento,
      municipios: this.db.municipio,
      barrios: this.db.barrio
    };
  }

  public getSupervisores(): Supervisor[] { return this.db.supervisores; }
  public getAgentes(): Agente[] { return this.db.agentes; }
  public getCampanas(): Campana[] { return this.db.campanas; }
  public getBaseAsesores(): BaseDataAsesor[] { return this.db.baseAsesores; }
  public getTipificaciones(): Tipificacion[] { return this.db.tipificaciones; }
  public getClientes(): BaseDatosCliente[] { return this.db.clientes; }
  public getInteracciones(): Interaccion[] { return this.db.interacciones; }
  public getCasos(): Caso[] { return this.db.casos; }
  public getRegistroAgentes(): RegistroAgente[] { return this.db.registroAgentes; }
  public getRegistroSupervisores(): RegistroSupervisor[] { return this.db.registroSupervisores; }

  // --- CRUD CLIENTES (con soporte de columnas dinámicas) ---
  public addCliente(clientData: Omit<BaseDatosCliente, 'conCli'>): BaseDatosCliente {
    const nextConCli = this.db.clientes.length > 0 ? Math.max(...this.db.clientes.map(c => c.conCli)) + 1 : 1;
    const newClient: BaseDatosCliente = { ...clientData, conCli: nextConCli };
    this.db.clientes.unshift(newClient);
    this.saveDB();
    return newClient;
  }

  public updateCliente(client: BaseDatosCliente): BaseDatosCliente {
    const idx = this.db.clientes.findIndex(c => c.conCli === client.conCli);
    if (idx !== -1) {
      this.db.clientes[idx] = client;
      this.saveDB();
    }
    return client;
  }

  public deleteCliente(conCli: number) {
    this.db.clientes = this.db.clientes.filter(c => c.conCli !== conCli);
    this.saveDB();
  }

  // --- CRUD CAMPAÑAS & ASESORES POR CAMPAÑA ---
  public addCampana(campanaData: Omit<Campana, 'codCam'>): Campana {
    const nextCod = this.db.campanas.length > 0 ? Math.max(...this.db.campanas.map(c => c.codCam)) + 1 : 1;
    const newCam: Campana = { ...campanaData, codCam: nextCod };
    this.db.campanas.unshift(newCam);
    this.saveDB();
    return newCam;
  }

  public updateCampana(campana: Campana) {
    const idx = this.db.campanas.findIndex(c => c.codCam === campana.codCam);
    if (idx !== -1) {
      this.db.campanas[idx] = campana;
      this.saveDB();
    }
  }

  public asignarAgenteACampana(idAge: string, codCam: number) {
    const exists = this.db.baseAsesores.some(ba => ba.idAgeAse === idAge && ba.codCamAse === codCam);
    if (!exists) {
      const nextId = this.db.baseAsesores.length > 0 ? Math.max(...this.db.baseAsesores.map(b => b.conAse)) + 1 : 1;
      this.db.baseAsesores.push({ conAse: nextId, idAgeAse: idAge, codCamAse: codCam });
      this.saveDB();
    }
  }

  public desasignarAgenteDeCampana(conAse: number) {
    this.db.baseAsesores = this.db.baseAsesores.filter(ba => ba.conAse !== conAse);
    this.saveDB();
  }

  public updateAsignacionAsesor(conAse: number, idAge: string, codCam: number) {
    const idx = this.db.baseAsesores.findIndex(ba => ba.conAse === conAse);
    if (idx !== -1) {
      this.db.baseAsesores[idx] = { conAse, idAgeAse: idAge, codCamAse: codCam };
      this.saveDB();
    }
  }

  public addTipificacion(codCam: number, nomTip: string) {
    const nextId = this.db.tipificaciones.length > 0 ? Math.max(...this.db.tipificaciones.map(t => t.codTip)) + 1 : 1;
    const newTip = { codTip: nextId, codCamTip: codCam, nomTip };
    this.db.tipificaciones.push(newTip);
    this.saveDB();
    return newTip;
  }

  public saveTipificacionesParaCampana(codCam: number, nombresTipificaciones: string[]) {
    // Primero, remover las tipificaciones actuales de esta campaña
    this.db.tipificaciones = this.db.tipificaciones.filter(t => t.codCamTip !== codCam);
    // Luego, insertar las nuevas
    nombresTipificaciones.forEach(nom => {
      this.addTipificacion(codCam, nom);
    });
  }

  // --- ASIGNACIÓN OPERATIVA DE SIGUIENTE CONTACTO ---
  public getSiguienteContactoAleatorio(idAge: string): { cliente: BaseDatosCliente; campana: Campana } | null {
    // Buscar campañas a las que pertenece el agente
    const camIds = this.db.baseAsesores.filter(ba => ba.idAgeAse === idAge).map(ba => ba.codCamAse);
    const campanasValidas = this.db.campanas.filter(c => c.activa && (camIds.length === 0 || camIds.includes(c.codCam)));
    
    if (campanasValidas.length === 0 || this.db.clientes.length === 0) return null;

    // Tomar campaña aleatoria
    const campana = campanasValidas[Math.floor(Math.random() * campanasValidas.length)];
    // Tomar clientes asociados a esa campaña o aleatorio general
    const clientesCampana = this.db.clientes.filter(c => c.codCamCli === campana.codCam);
    const pool = clientesCampana.length > 0 ? clientesCampana : this.db.clientes;
    const cliente = pool[Math.floor(Math.random() * pool.length)];

    return { cliente, campana };
  }

  // --- REGISTRO DE INTERACCIÓN & REGLA OBLIGATORIA DE TICKET ---
  public registrarContacto(
    interaccionData: Omit<Interaccion, 'codInt'>,
    casoData?: { comIntCas: string; estado: 'Abierto' | 'Escalado' }
  ): { interaccion: Interaccion; caso?: Caso } {
    // REGLA OBLIGATORIA: Si idEstCasInt es 1 (Abierto) o 3 (Escalado), DEBE venir casoData
    if ((interaccionData.idEstCasInt === 1 || interaccionData.idEstCasInt === 3)) {
      if (!casoData || !casoData.comIntCas || casoData.comIntCas.trim() === '') {
        throw new Error('REGLA DE NEGOCIO: El caso ha quedado Abierto o Escalado. Debe crear y diligenciar el ticket del caso antes de guardar el contacto.');
      }
    }

    const nextCodInt = this.db.interacciones.length > 0 ? Math.max(...this.db.interacciones.map(i => i.codInt)) + 1 : 101;
    const nuevaInteraccion: Interaccion = { ...interaccionData, codInt: nextCodInt };
    this.db.interacciones.unshift(nuevaInteraccion);

    let nuevoCaso: Caso | undefined = undefined;

    if (casoData && (interaccionData.idEstCasInt === 1 || interaccionData.idEstCasInt === 3)) {
      const nextCodCas = this.db.casos.length > 0 ? Math.max(...this.db.casos.map(c => c.codCas)) + 1 : 5001;
      nuevoCaso = {
        codCas: nextCodCas,
        codIntCas: nextCodInt,
        comIntCas: casoData.comIntCas,
        fecIniCas: interaccionData.fecInt,
        estado: casoData.estado,
        agenteAsignado: this.db.baseAsesores.find(b => b.conAse === interaccionData.conAseInt)?.idAgeAse
      };
      this.db.casos.unshift(nuevoCaso);
    }

    this.saveDB();
    return { interaccion: nuevaInteraccion, caso: nuevoCaso };
  }

  // --- GESTIÓN DE CASOS (TICKETS) ---
  public actualizarCaso(codCas: number, nuevoEstado: Caso['estado'], comentarioAdicional?: string) {
    const caso = this.db.casos.find(c => c.codCas === codCas);
    if (caso) {
      caso.estado = nuevoEstado;
      if (nuevoEstado === 'Cerrado') {
        caso.fecCieCas = new Date().toISOString().split('T')[0];
      }
      if (comentarioAdicional) {
        caso.comIntCas = `${caso.comIntCas}\n[${new Date().toLocaleTimeString()}] ${comentarioAdicional}`;
      }
      this.saveDB();
    }
  }

  // --- GESTIÓN DE USUARIOS (PERFILES) ---
  public addAgente(agenteData: Agente): Agente {
    this.db.agentes.push(agenteData);
    this.saveDB();
    return agenteData;
  }

  public deleteAgente(idAge: string): void {
    this.db.agentes = this.db.agentes.filter(a => a.idAge !== idAge);
    this.db.baseAsesores = this.db.baseAsesores.filter(ba => ba.idAgeAse !== idAge);
    this.saveDB();
  }

  public updateAgenteProfile(idAge: string, data: Partial<Agente>): Agente | null {
    const idx = this.db.agentes.findIndex(a => a.idAge === idAge);
    if (idx !== -1) {
      this.db.agentes[idx] = { ...this.db.agentes[idx], ...data };
      this.saveDB();
      return this.db.agentes[idx];
    }
    return null;
  }

  public updateSupervisorProfile(idSup: string, data: Partial<Supervisor>): Supervisor | null {
    const idx = this.db.supervisores.findIndex(s => s.idSup === idSup);
    if (idx !== -1) {
      this.db.supervisores[idx] = { ...this.db.supervisores[idx], ...data };
      this.saveDB();
      return this.db.supervisores[idx];
    }
    return null;
  }

  public updateAgentStatus(idAge: string, status: Agente['estadoActual'], conectado: boolean) {
    const a = this.db.agentes.find(ag => ag.idAge === idAge);
    if (a) {
      a.estadoActual = status;
      a.conectado = conectado;
      this.saveDB();
    }
  }

  // --- REGISTRO DE SESIÓN (TIEMPOS) ---
  public registrarInicioSesion(userId: string, role: 'supervisor' | 'agente'): number {
    const ahora = new Date().toISOString();
    if (role === 'agente') {
      const nextCod = this.db.registroAgentes.length > 0 ? Math.max(...this.db.registroAgentes.map(r => r.codRegAge)) + 1 : 1;
      this.db.registroAgentes.push({ codRegAge: nextCod, idAgeRegAge: userId, fecHoraIniRegAge: ahora });
      this.updateAgentStatus(userId, 'Disponible', true);
      this.saveDB();
      return nextCod;
    } else {
      const nextCod = this.db.registroSupervisores.length > 0 ? Math.max(...this.db.registroSupervisores.map(r => r.codRegSup)) + 1 : 1;
      this.db.registroSupervisores.push({ codRegSup: nextCod, idSupRegSup: userId, fecHoraIniRegSup: ahora });
      const sup = this.db.supervisores.find(s => s.idSup === userId);
      if (sup) sup.conectado = true;
      this.saveDB();
      return nextCod;
    }
  }

  public registrarCierreSesion(codRegistro: number, userId: string, role: 'supervisor' | 'agente') {
    const ahora = new Date();
    if (role === 'agente') {
      const reg = this.db.registroAgentes.find(r => r.codRegAge === codRegistro);
      if (reg) {
        reg.fecHoraCieRegAge = ahora.toISOString();
        const ini = new Date(reg.fecHoraIniRegAge);
        const mins = Math.round((ahora.getTime() - ini.getTime()) / 60000);
        reg.tieTotRegAge = `${Math.floor(mins / 60)}h ${mins % 60}m`;
      }
      this.updateAgentStatus(userId, 'Desconectado', false);
    } else {
      const reg = this.db.registroSupervisores.find(r => r.codRegSup === codRegistro);
      if (reg) {
        reg.fecHoraCieRegSup = ahora.toISOString();
      }
      const sup = this.db.supervisores.find(s => s.idSup === userId);
      if (sup) sup.conectado = false;
    }
    this.saveDB();
  }
}
