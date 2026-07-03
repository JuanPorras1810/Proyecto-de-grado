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
  BaseDataAsesor
} from '../types/db';

export const SEED_TIPO_DOCUMENTO: TipoDocumento[] = [
  { idTipDoc: 1, nomTipDoc: 'Cédula de Ciudadanía' },
  { idTipDoc: 2, nomTipDoc: 'Cédula de Extranjería' },
  { idTipDoc: 3, nomTipDoc: 'Pasaporte' },
];

export const SEED_CANAL_CONTACTO: CanalContacto[] = [
  { idCanInt: 1, nomCanInt: 'Llamada' },
  { idCanInt: 2, nomCanInt: 'Chat' },
  { idCanInt: 3, nomCanInt: 'Correo' },
];

export const SEED_ESTADO_CASO: EstadoCaso[] = [
  { idEstCas: 1, nomEstCas: 'Abierto' },
  { idEstCas: 2, nomEstCas: 'Cerrado' },
  { idEstCas: 3, nomEstCas: 'Escalado' },
];

export const SEED_DEPARTAMENTO: Departamento[] = [
  { idDep: 1, nomDep: 'Santander' },
  { idDep: 2, nomDep: 'Antioquia' },
  { idDep: 3, nomDep: 'Cundinamarca' },
];

export const SEED_MUNICIPIO: Municipio[] = [
  { idMun: 1, idDepMun: 1, nomMun: 'Bucaramanga' },
  { idMun: 2, idDepMun: 2, nomMun: 'Medellín' },
  { idMun: 3, idDepMun: 3, nomMun: 'Bogotá' },
];

export const SEED_BARRIO: Barrio[] = [
  { idBar: 1, idMunBar: 1, nomBar: 'Cabecera' },
  { idBar: 2, idMunBar: 2, nomBar: 'El Poblado' },
  { idBar: 3, idMunBar: 3, nomBar: 'Chapinero' },
];

export const SEED_SUPERVISORES: Supervisor[] = [
  {
    idSup: '1098765432',
    idTipDocSup: 1,
    idBarSup: 1,
    nomSup: 'Carlos Mendoza (Supervisor SENA)',
    emaSup: 'carlos.mendoza@sena.edu.co',
    dirSup: 'Calle 35 # 12-45',
    telSup: '3109876543',
    telAltSup: '3201112233',
    conSup: 'admin123',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    conectado: true
  },
  {
    idSup: '9876543210',
    idTipDocSup: 1,
    idBarSup: 2,
    nomSup: 'Diana Salazar (Líder Calidad)',
    emaSup: 'diana.salazar@sena.edu.co',
    dirSup: 'Av El Poblado # 4-50',
    telSup: '3156667788',
    conSup: 'super123',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    conectado: false
  }
];

export const SEED_AGENTES: Agente[] = [
  {
    idAge: '1102345678',
    idTipDocAge: 1,
    idBarAge: 1,
    nomAge: 'Juan Porras (Aprendiz Contact)',
    emaAge: 'juanporras1810@gmail.com',
    dirAge: 'Carrera 27 # 45-12',
    telAge: '3001234567',
    telAltAge: '3119998877',
    conAge: 'agente123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    conectado: true,
    estadoActual: 'Disponible'
  },
  {
    idAge: '1098112233',
    idTipDocAge: 1,
    idBarAge: 2,
    nomAge: 'María Fernanda Ruiz',
    emaAge: 'maferuiz@gmail.com',
    dirAge: 'Calle 10 # 34-89',
    telAge: '3124445566',
    conAge: 'agente123',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    conectado: true,
    estadoActual: 'En llamada'
  },
  {
    idAge: '1033445566',
    idTipDocAge: 1,
    idBarAge: 3,
    nomAge: 'Andrés Felipe Torres',
    emaAge: 'andres.torres@gmail.com',
    dirAge: 'Calle 72 # 11-20',
    telAge: '3187778899',
    conAge: 'agente123',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    conectado: false,
    estadoActual: 'Desconectado'
  }
];

export const SEED_CAMPANAS: Campana[] = [
  {
    codCam: 1,
    nomCam: 'Retención de Clientes 2026',
    fecIniCam: '2026-01-01',
    fecFinCam: '2026-12-31',
    proCam: 'Retener al menos el 75% de clientes con intención de cancelación voluntaria mediante beneficios.',
    scriptBasico: 'Buenos días/tardes. Le saluda [Agente] del departamento de fidelización de SENA Telecom. Observamos que ha solicitado información para cancelar su servicio. Hoy queremos ofrecerle un descuento especial del 30% en sus próximas 6 facturas...',
    activa: true,
    camposPersonalizados: [
      { id: 'cp1', nombre: 'Motivo Insatisfacción', tipo: 'opciones', opciones: ['Precio alto', 'Fallas técnicas', 'Competencia', 'Mudanza'] },
      { id: 'cp2', nombre: 'Oferta Aceptada', tipo: 'opciones', opciones: ['Descuento 30%', 'Duplicar megas', 'Rechaza oferta'] },
      { id: 'cp3', nombre: 'Valor Factura Promedio', tipo: 'numero' }
    ]
  },
  {
    codCam: 2,
    nomCam: 'Ventas Cruzadas Servicio Premium',
    fecIniCam: '2026-03-01',
    fecFinCam: '2026-09-30',
    proCam: 'Ofrecer actualización a paquete corporativo y fibra óptica de 1000 Mbps.',
    scriptBasico: 'Estimado cliente, por ser uno de nuestros usuarios más cumplidos, ha sido preaprobado para migrar al paquete de Fibra Óptica Simétrica Premium sin costo de instalación...',
    activa: true,
    camposPersonalizados: [
      { id: 'cp4', nombre: 'Plan Actual', tipo: 'texto' },
      { id: 'cp5', nombre: 'Velocidad Ofrecida', tipo: 'opciones', opciones: ['500 Mbps', '1000 Mbps'] }
    ]
  },
  {
    codCam: 3,
    nomCam: 'Soporte Técnico Especializado',
    fecIniCam: '2026-01-15',
    fecFinCam: '2026-11-30',
    proCam: 'Resolver incidencias de módem y configuración remota en primer contacto.',
    scriptBasico: 'Gracias por comunicarse con la línea de Soporte Avanzado. Por favor indíqueme los leds que parpadean en su equipo frontal...',
    activa: true,
    camposPersonalizados: [
      { id: 'cp6', nombre: 'Modelo Módem', tipo: 'texto' },
      { id: 'cp7', nombre: 'Visita Técnica Requerida', tipo: 'opciones', opciones: ['Sí', 'No'] }
    ]
  }
];

export const SEED_BASE_ASESOR: BaseDataAsesor[] = [
  { conAse: 1, idAgeAse: '1102345678', codCamAse: 1 },
  { conAse: 2, idAgeAse: '1102345678', codCamAse: 2 },
  { conAse: 3, idAgeAse: '1098112233', codCamAse: 1 },
  { conAse: 4, idAgeAse: '1033445566', codCamAse: 3 },
];

export const SEED_TIPIFICACION: Tipificacion[] = [
  { codTip: 1, codCamTip: 1, nomTip: 'Retención Exitosa' },
  { codTip: 2, codCamTip: 1, nomTip: 'Cancelación Inminente' },
  { codTip: 3, codCamTip: 1, nomTip: 'Volver a llamar' },
  { codTip: 4, codCamTip: 2, nomTip: 'Venta Cerrada' },
  { codTip: 5, codCamTip: 2, nomTip: 'No Le Interesa' },
  { codTip: 6, codCamTip: 3, nomTip: 'Resuelto en Línea' },
  { codTip: 7, codCamTip: 3, nomTip: 'Falla Física Módem' },
];

export const SEED_CLIENTES: BaseDatosCliente[] = [
  {
    conCli: 1,
    idTipDoCli: 1,
    idBarCli: 1,
    codCamCli: 1,
    idCli: '1000000001',
    nomCli: 'Carlos Ruiz García',
    emaCli: 'carlos.ruiz@gmail.com',
    dirCli: 'Calle 45 # 12-89, Cabecera',
    telCli: '3004444444',
    telAltCli: '6076333333',
    obsCli: 'Cliente antiguo (6 años). Molesto por aumento de tarifa en última factura.',
    datosAdicionales: { 'Motivo Insatisfacción': 'Precio alto', 'Valor Factura Promedio': '125000' }
  },
  {
    conCli: 2,
    idTipDoCli: 1,
    idBarCli: 2,
    codCamCli: 1,
    idCli: '1000000002',
    nomCli: 'Ana Sofía Torres',
    emaCli: 'ana.torres@empresa.com',
    dirCli: 'Carrera 43A # 1-50, Poblado',
    telCli: '3005555555',
    obsCli: 'Reporta lentitud intermitente en horas pico de la noche.',
    datosAdicionales: { 'Motivo Insatisfacción': 'Fallas técnicas' }
  },
  {
    conCli: 3,
    idTipDoCli: 1,
    idBarCli: 3,
    codCamCli: 2,
    idCli: '1000000003',
    nomCli: 'Gabriel Gómez Vargas',
    emaCli: 'ggomez@vargas.co',
    dirCli: 'Calle 67 # 9-14, Chapinero',
    telCli: '3112223344',
    obsCli: 'Potencial cliente corporativo para fibra simétrica.',
    datosAdicionales: { 'Plan Actual': 'Hogar 200 Mbps' }
  },
  {
    conCli: 4,
    idTipDoCli: 2,
    idBarCli: 1,
    codCamCli: 3,
    idCli: 'E998877665',
    nomCli: 'John Smith Anderson',
    emaCli: 'jsmith@tech.org',
    dirCli: 'Avenida 27 # 32-10',
    telCli: '3209991122',
    obsCli: 'Extranjero residente, requiere asistencia en configuración de IP fija.',
    datosAdicionales: { 'Modelo Módem': 'Huawei HG8245H' }
  },
  {
    conCli: 5,
    idTipDoCli: 1,
    idBarCli: 2,
    codCamCli: 2,
    idCli: '1000000005',
    nomCli: 'Lucía Méndez Castro',
    emaCli: 'lmendez@castro.com',
    dirCli: 'Transversal 5 # 10-22',
    telCli: '3178889900',
    obsCli: 'Interesada en promo de 1000 Mbps.',
    datosAdicionales: { 'Plan Actual': 'Cobre 50 Mbps' }
  }
];

export const SEED_INTERACCIONES: Interaccion[] = [
  {
    codInt: 101,
    conAseInt: 1, // Juan Porras
    conCliInt: 1, // Carlos Ruiz
    codTipInt: 1, // Retención exitosa
    idCanInt: 1, // Llamada
    idEstCasInt: 2, // Cerrado
    motInt: 'Solicitud de cancelación voluntaria por precio',
    fecInt: '2026-06-28',
    horIniInt: '10:15:00',
    horFinInt: '10:22:30',
    tieProInt: '07m 30s',
    obsInt: 'Se aplicó descuento del 30% por 6 meses. Cliente satisfecho retira solicitud de baja.',
    resultado: 'Resuelto en primer contacto'
  },
  {
    codInt: 102,
    conAseInt: 3, // María Fernanda
    conCliInt: 2, // Ana Torres
    codTipInt: 2, // Cancelación inminente
    idCanInt: 2, // Chat
    idEstCasInt: 1, // Abierto (Generó ticket)
    motInt: 'Fallas técnicas reiteradas en internet hogar',
    fecInt: '2026-06-28',
    horIniInt: '11:00:00',
    horFinInt: '11:12:45',
    tieProInt: '12m 45s',
    obsInt: 'Cliente furiosa exige visita técnica urgente. Se escala al equipo de ingeniería de campo.',
    resultado: 'Caso Abierto / Requiere soporte físico'
  },
  {
    codInt: 103,
    conAseInt: 1, // Juan Porras
    conCliInt: 4, // John Smith
    codTipInt: 7, // Falla física módem
    idCanInt: 1, // Llamada
    idEstCasInt: 3, // Escalado (Generó ticket)
    motInt: 'Módem no enciende tras tormenta eléctrica',
    fecInt: '2026-06-28',
    horIniInt: '14:20:00',
    horFinInt: '14:26:10',
    tieProInt: '06m 10s',
    obsInt: 'Se valida con el cliente que no llega voltaje. Escalado a logística para cambio de equipo.',
    resultado: 'Escalado a soporte logístico'
  }
];

export const SEED_CASOS: Caso[] = [
  {
    codCas: 5001,
    codIntCas: 102,
    comIntCas: 'VISITA TÉCNICA URGENTE: Cliente Ana Torres reporta pérdida de paquetes del 40% en Nodo Poblado Sur. Agendar técnico para mañana a las 8am.',
    fecIniCas: '2026-06-28',
    estado: 'Abierto',
    agenteAsignado: '1098112233'
  },
  {
    codCas: 5002,
    codIntCas: 103,
    comIntCas: 'CAMBIO DE MÓDEM QUEMADO: Enviar mensajero con equipo Huawei óptico de reemplazo a dirección de Cabecera.',
    fecIniCas: '2026-06-28',
    estado: 'Escalado',
    agenteAsignado: '1102345678'
  }
];
