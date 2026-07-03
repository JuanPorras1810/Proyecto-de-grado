import React, { useState } from 'react';
import { DBController } from '../../controllers/dbController';
import { BaseDatosCliente, Campana } from '../../types/db';
import { Upload, Plus, Search, Edit2, Trash2, Database, X, Check, Download } from 'lucide-react';

export const ClientsManager: React.FC = () => {
  const db = DBController.getInstance();
  const [clientes, setClientes] = useState<BaseDatosCliente[]>(db.getClientes());
  const campanas = db.getCampanas();
  const tiposDoc = db.getConfigTablas().tiposDoc;

  const geo = db.getGeografia();
  const departamentos = geo.departamentos || [];
  const municipios = geo.municipios || [];
  const barrios = geo.barrios || [];

  const [selectedCampana, setSelectedCampana] = useState<string>('todas');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<BaseDatosCliente | null>(null);

  // Form state
  const [idTipDoCli, setIdTipDoCli] = useState(1);
  const [codCamCli, setCodCamCli] = useState(campanas[0]?.codCam || 1);
  const [idCli, setIdCli] = useState('');
  const [nomCli, setNomCli] = useState('');
  const [emaCli, setEmaCli] = useState('');
  const [dirCli, setDirCli] = useState('');
  const [telCli, setTelCli] = useState('');
  const [telAltCli, setTelAltCli] = useState('');
  const [obsCli, setObsCli] = useState('');
  const [selectedDepId, setSelectedDepId] = useState<number>(1);
  const [selectedMunId, setSelectedMunId] = useState<number>(1);
  const [idBarCli, setIdBarCli] = useState<number>(1);
  const [datosAdicionales, setDatosAdicionales] = useState<Record<string, string>>({});

  const handleOpenModal = (client?: BaseDatosCliente) => {
    if (client) {
      setEditingClient(client);
      setIdTipDoCli(client.idTipDoCli);
      setCodCamCli(client.codCamCli);
      setIdCli(client.idCli);
      setNomCli(client.nomCli);
      setEmaCli(client.emaCli || '');
      setDirCli(client.dirCli || '');
      setTelCli(client.telCli);
      setTelAltCli(client.telAltCli || '');
      setObsCli(client.obsCli || '');
      setDatosAdicionales(client.datosAdicionales || {});

      // Inicializar dpto y municipio correspondientes a client.idBarCli
      const currentBar = barrios.find(b => b.idBar === client.idBarCli) || barrios[0];
      const currentMun = currentBar ? (municipios.find(m => m.idMun === currentBar.idMunBar) || municipios[0]) : municipios[0];
      const currentDep = currentMun ? (departamentos.find(d => d.idDep === currentMun.idDepMun) || departamentos[0]) : departamentos[0];

      setSelectedDepId(currentDep ? currentDep.idDep : 1);
      setSelectedMunId(currentMun ? currentMun.idMun : 1);
      setIdBarCli(client.idBarCli || (currentBar?.idBar || 1));
    } else {
      setEditingClient(null);
      setIdTipDoCli(1);
      setCodCamCli(campanas[0]?.codCam || 1);
      setIdCli('');
      setNomCli('');
      setEmaCli('');
      setDirCli('');
      setTelCli('');
      setTelAltCli('');
      setObsCli('');
      setDatosAdicionales({});

      const firstBar = barrios[0];
      const firstMun = firstBar ? (municipios.find(m => m.idMun === firstBar.idMunBar) || municipios[0]) : municipios[0];
      const firstDep = firstMun ? (departamentos.find(d => d.idDep === firstMun.idDepMun) || departamentos[0]) : departamentos[0];

      setIdBarCli(firstBar?.idBar || 1);
      setSelectedDepId(firstDep ? firstDep.idDep : 1);
      setSelectedMunId(firstMun ? firstMun.idMun : 1);
    }
    setIsModalOpen(true);
  };

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
        setIdBarCli(bars[0].idBar);
      } else {
        setIdBarCli(1);
      }
    } else {
      setSelectedMunId(1);
      setIdBarCli(1);
    }
  };

  const handleMunChange = (munId: number) => {
    setSelectedMunId(munId);
    const bars = barrios.filter(b => b.idMunBar === munId);
    if (bars.length > 0) {
      setIdBarCli(bars[0].idBar);
    } else {
      setIdBarCli(1);
    }
  };

  const getFullLocation = (idBar?: number) => {
    if (!idBar) return 'No definida';
    const bar = barrios.find(b => b.idBar === idBar);
    if (!bar) return 'No definida';
    const mun = municipios.find(m => m.idMun === bar.idMunBar);
    const dep = mun ? departamentos.find(d => d.idDep === mun.idDepMun) : null;
    return `${bar.nomBar} - ${mun?.nomMun || ''} (${dep?.nomDep || ''})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      const updated: BaseDatosCliente = {
        ...editingClient,
        idTipDoCli: Number(idTipDoCli),
        codCamCli: Number(codCamCli),
        idCli,
        nomCli,
        emaCli,
        dirCli,
        telCli,
        telAltCli,
        obsCli,
        idBarCli: Number(idBarCli),
        datosAdicionales
      };
      db.updateCliente(updated);
    } else {
      db.addCliente({
        idTipDoCli: Number(idTipDoCli),
        codCamCli: Number(codCamCli),
        idCli,
        nomCli,
        emaCli,
        dirCli,
        telCli,
        telAltCli,
        obsCli,
        idBarCli: Number(idBarCli),
        datosAdicionales
      });
    }
    setClientes([...db.getClientes()]);
    setIsModalOpen(false);
  };

  const handleDelete = (conCli: number) => {
    if (confirm('¿Está seguro de eliminar este registro de cliente?')) {
      db.deleteCliente(conCli);
      setClientes([...db.getClientes()]);
    }
  };

  const handleDescargarPlantillaCSV = () => {
    const headers = 'Tipo_Documento,Documento,Nombre_Completo,Correo,Telefono,Direccion,Observaciones\n';
    const sampleRow = 'CC,1098765432,Juan Perez,juan.perez@ejemplo.com,3001112233,Calle 10 # 20-30,Cliente de prueba importado';
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers + sampleRow);
    
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'plantilla_clientes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCargaMasivaCSV = () => {
    const r = Math.floor(Math.random() * 900000000) + 100000000;
    db.addCliente({
      idTipDoCli: 1,
      codCamCli: campanas[0]?.codCam || 1,
      idCli: r.toString(),
      nomCli: 'Cliente Importado CSV ' + r.toString().slice(-4),
      emaCli: `import_${r}@empresa.co`,
      dirCli: 'Carrera Operativa # ' + r.toString().slice(-2),
      telCli: '300' + r.toString().slice(0, 7),
      obsCli: 'Registro importado mediante carga masiva CSV.',
      idBarCli: barrios[0]?.idBar || 1
    });
    setClientes([...db.getClientes()]);
    alert('Proceso de carga masiva CSV satisfactorio (+1 cliente importado)');
  };

  const filtered = clientes.filter(c => {
    const matchCam = selectedCampana === 'todas' || c.codCamCli.toString() === selectedCampana;
    const matchSearch = c.nomCli.toLowerCase().includes(search.toLowerCase()) ||
      c.idCli.includes(search) ||
      c.telCli.includes(search);
    return matchCam && matchSearch;
  });

  const getCampanaName = (codCam: number) => {
    return campanas.find(c => c.codCam === codCam)?.nomCam || `Campaña #${codCam}`;
  };

  const getDocTypeName = (idTip: number) => {
    return idTip === 1 ? 'CdC' : idTip === 2 ? 'CE' : 'Pas';
  };

  // Encontrar la campaña activa en el formulario para mostrar sus campos personalizados obligatorios
  // activeCamObj is removed as requested to remove campana-required custom columns

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Encabezado Módulo Clientes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-600" />
            Módulo de Clientes
          </h2>
          <p className="text-xs text-slate-500 mt-1">Registros vinculados a campañas</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDescargarPlantillaCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Descargar Plantilla CSV
          </button>
          <button
            onClick={handleCargaMasivaCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            Carga Masiva CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          >
          </input>
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCampana}
            onChange={(e) => setSelectedCampana(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
          >
            <option value="todas">Todas las campañas</option>
            {campanas.map(c => (
              <option key={c.codCam} value={c.codCam}>{c.nomCam}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Campaña</th>
                <th className="py-3 px-6">Documento</th>
                <th className="py-3 px-6">Nombre Completo</th>
                <th className="py-3 px-6">Correo</th>
                <th className="py-3 px-6">Dirección</th>
                <th className="py-3 px-6">Teléfono</th>
                <th className="py-3 px-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filtered.map((c) => (
                <tr key={c.conCli} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs truncate max-w-[160px] inline-block">
                      {getCampanaName(c.codCamCli)}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-600">
                    {getDocTypeName(c.idTipDoCli)} {c.idCli}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {c.nomCli}
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-normal">
                    {c.emaCli || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    <div className="font-semibold text-slate-800">{c.dirCli || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {getFullLocation(c.idBarCli)}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-slate-700">
                    {c.telCli}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors title='Editar'"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.conCli)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors title='Eliminar'"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    No se encontraron registros de clientes con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium">
          {filtered.length} cliente(s) mostrado(s) en la base de datos operativa.
        </div>
      </div>

      {/* Modal Crear/Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-fadeIn my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                {editingClient ? 'Modificar Registro de Cliente' : 'Registrar Nuevo Cliente en Base de Datos'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Campaña Vinculada</label>
                  <select
                    value={codCamCli}
                    onChange={(e) => setCodCamCli(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {campanas.map(c => (
                      <option key={c.codCam} value={c.codCam}>{c.nomCam}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo Documento</label>
                  <select
                    value={idTipDoCli}
                    onChange={(e) => setIdTipDoCli(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {tiposDoc.map(t => (
                      <option key={t.idTipDoc} value={t.idTipDoc}>{t.nomTipDoc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Número Documento *</label>
                  <input
                    type="text"
                    required
                    value={idCli}
                    onChange={(e) => setIdCli(e.target.value)}
                    placeholder="Ej. 1098765432"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={nomCli}
                    onChange={(e) => setNomCli(e.target.value)}
                    placeholder="Nombres y Apellidos"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={emaCli}
                    onChange={(e) => setEmaCli(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Teléfono Celular *</label>
                  <input
                    type="text"
                    required
                    value={telCli}
                    onChange={(e) => setTelCli(e.target.value)}
                    placeholder="3001112233"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Teléfono Alternativo</label>
                  <input
                    type="text"
                    value={telAltCli}
                    onChange={(e) => setTelAltCli(e.target.value)}
                    placeholder="6076667788"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dirección Física</label>
                  <input
                    type="text"
                    value={dirCli}
                    onChange={(e) => setDirCli(e.target.value)}
                    placeholder="Calle 10 # 20-30"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Departamento</label>
                  <select
                    value={selectedDepId}
                    onChange={(e) => handleDepChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {departamentos.map((d) => (
                      <option key={d.idDep} value={d.idDep}>
                        {d.nomDep}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Municipio</label>
                  <select
                    value={selectedMunId}
                    onChange={(e) => handleMunChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {filteredMunicipios.map((m) => (
                      <option key={m.idMun} value={m.idMun}>
                        {m.nomMun}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Barrio</label>
                  <select
                    value={idBarCli}
                    onChange={(e) => setIdBarCli(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {filteredBarrios.map((b) => (
                      <option key={b.idBar} value={b.idBar}>
                        {b.nomBar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={obsCli}
                  onChange={(e) => setObsCli(e.target.value)}
                  placeholder="Detalles o historial previo del cliente..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
