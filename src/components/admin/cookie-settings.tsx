"use client"

import { deleteAllDocumentsByTest, getIdeasStatus, getAllIdeas, startGenerateBackups, startGenerateNotification } from "@/api/admin"
import { getAllFlags, setChangeStatusConfig } from "@/api/config"
import { auditLogAction } from "@/api/log"
import { Config } from "@/models/config.entity"
import useClientIp from "@/registry/new-york/hooks/use-client-ip"
import { toast } from "@/registry/new-york/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/new-york/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"
import { Label } from "@/registry/new-york/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york/ui/tabs"
import { AuthContext } from "@/services/auth"
import { useTabs } from "@/services/contexts/tabs-context"
import { useTranslation } from 'react-i18next';
import { ArrowCircleLeftIcon, BackspaceIcon, InformationCircleIcon, SaveAsIcon } from "@heroicons/react/outline"
import { ArrowBigRightDashIcon, BellElectricIcon, CheckIcon, DoorClosedIcon, Eye, FolderSyncIcon, RouteOffIcon, X } from "lucide-react"
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react"
import ToggleSwitch from "../forms/toggleSwitch"
import Loading from "../layouts/loading/loading"
import Modal from "../layouts/modal/modal"
import AuditLogComponent from "../logger/audit-log"
import LogsDashboardChart from "../logger/chart/logs-dashboard-chart"
import ClientIp from "../logger/client-ip"
import LogsTable from "../logger/logs-table"
import SearchConfigs from "../search/search-config"
import CurrentDateTime from "../utils/current-datetime"

export function AdminCookieSettings() {
  const { t } = useTranslation();
  const { clientIp } = useClientIp();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [ideasStatus, setIdeasStatus] = useState<{
    ideasPath: string;
    fileExists: boolean;
    totalIdeas: number;
    lastModified: string | null;
  } | null>(null);
  const [ideasData, setIdeasData] = useState<any[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasPage, setIdeasPage] = useState(1);
  const [ideasFilter, setIdeasFilter] = useState<string | null>(null);
  const [prioridadFilter, setPrioridadFilter] = useState<string | null>(null);
  const [detailIdea, setDetailIdea] = useState<any>(null);
  const IDEAS_PAGE_SIZE = 12;

  const filteredIdeas = ideasData.filter((i: any) => {
    if (ideasFilter && i.estado !== ideasFilter) return false;
    if (prioridadFilter && i.prioridad !== prioridadFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setIdeasFilter(null);
    setPrioridadFilter(null);
  };

  // Resetear página al cambiar filtro
  useEffect(() => { setIdeasPage(1); }, [ideasFilter, prioridadFilter]);

  const [showModal, setShowModal] = useState(false);
  const [showModalNotification, setShowModalNotification] = useState(false);
  const [showModalBackups, setShowModalBackups] = useState(false);
  const [dataFlags, setDataFlags] = useState<Config[]>([]);
  const { closeTabWithRefresh, refreshData } = useTabs();
  const [configs, setConfigs] = useState<any[]>([]);
  const [valConfig, setValConfig] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [databaseNameClient, setDatabaseNameClient] = useState('');
  const [collectionNameClient, setCollectionNameClient] = useState('');
  const [stringUserClient, setStringUserClient] = useState('');
  const [stringKeyClient, setStringKeyClient] = useState('');
  const [databaseNameContract, setDatabaseNameContract] = useState('');
  const [stringUserContract, setStringUserContract] = useState('');
  const [collectionNameContract, setCollectionNameContract] = useState('');
  const [stringKeyContract, setStringKeyContract] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await getAllFlags(1, 1000);
        setDataFlags(response?.configs);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    if (dataFlags?.length == 0) {
      fetchLogs();
    }
  }, [dataFlags]);

  // Load ideas from MongoDB
  useEffect(() => {
    const fetchIdeasData = async () => {
      setIdeasLoading(true);
      const result = await getAllIdeas(1, 500);
      if (result?.data) {
        setIdeasData(result.data);
      }
      setIdeasLoading(false);
    };
    fetchIdeasData();
  }, []);

  // Load ideas.json status (file-based fallback)
  useEffect(() => {
    const fetchIdeasStatus = async () => {
      const status = await getIdeasStatus();
      setIdeasStatus(status);
    };
    fetchIdeasStatus();
  }, []);

  const handleChangeSoftDelete = async () => {
    try {
      setShowModal(false);
      setIsLoading(true);
      const deleteResponse = await deleteAllDocumentsByTest();
      if (deleteResponse) {
        await auditLogAction(user?.username ?? '', "Limpieza masiva de datos en BD", "Reseteo de datos", "Se ha realizado una limpieza de las colecciones de datos asociados a participaciones", clientIp ?? '');
        toast({
          title: "Mensaje de exito!",
          description: deleteResponse.message
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error.message);
      setIsLoading(false);
    }
  };

  const handleChangeGenerateBackups = async () => {
    setShowModalBackups(false);
    try {
      setIsLoading(true);
      const response = await startGenerateBackups();
      if (response) {
        await auditLogAction(user?.username ?? '', "Generación de copia de seguridad", "Generación de backups", "Se ha realizado una copia de seguridad para los datos actuales de la cartera", clientIp ?? '');
        toast({
          title: "Mensaje de exito!",
          description: response.message,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error.message);
      setIsLoading(false);
    }
  };

  const handleChangeGenerateNotifications = async () => {
    try {
      setIsLoading(true);
      setShowModalNotification(false);
      const response = await startGenerateNotification();
      if (response) {
        await auditLogAction(user?.username ?? '', "Generación de notificación masiva", "Notificacion de estados de participaciones", "Se ha realizado una notificación masiva del estado general de participaciones", clientIp ?? '');
        toast({
          title: "Mensaje de exito!",
          description: response.message,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error.message);
      setIsLoading(false);
    }
  };

  const handlerChangeStatusConfig = async (flag: any) => {
    try {
      setIsLoading(true);
      const response = await setChangeStatusConfig(flag._id, !flag.isActive);
      if (response) {
        await auditLogAction(user?.username ?? '', "Actualización de configuración", "Actualización de configuración", "Se ha realizado una actualización de estado de la configuración", clientIp ?? '');
        toast({
          title: "Mensaje de exito!",
          description: 'Se ha realizado una actualización de estado de la configuración',
        });

        setDataFlags([]);
        setIsLoading(false);
      }

    } catch (error) {
      console.log(error.message);
      setIsLoading(false);
    }
  };

  return (<div className='gap-x-4 pb-2 px-2'>
    <div className="col-span-full mt-2 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12 mx-2">
      <div className="flex items-center sm:col-span-6">
        <h2 className="text-3xl font-bold tracking-tight pb-3 ml-2">Panel de administración de la aplicación</h2>
      </div>
      <div className="flex items-center justify-end sm:col-span-6">
        <Card className="bg-white rounded-md px-2 pl-2 mb-3 pb-1">
          <CurrentDateTime />
        </Card>
      </div>
    </div>
    <Tabs defaultValue="overview" className="space-y-5 mt-0">
      <TabsList className="bg-white rounded-md">
        <TabsTrigger value="overview" className="hover:text-gray-700 data-[state=active]:bg-gray-100">
          Configuración de la aplicación
        </TabsTrigger>
        <TabsTrigger value="dashboard" className="hover:text-gray-700 data-[state=active]:bg-gray-100" >
          Monitor de peticiones al API
        </TabsTrigger>
        <TabsTrigger value="analytics" className="hover:text-gray-700 data-[state=active]:bg-gray-100" >
          Logs de peticiones
        </TabsTrigger>
        <TabsTrigger value="audit" className="hover:text-gray-700 data-[state=active]:bg-gray-100" >
          Logs de auditoria interna
        </TabsTrigger>
        <TabsTrigger value="ideas" className="hover:text-gray-700 data-[state=active]:bg-gray-100" >
          Ideas del Sistema
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
          <Card className="col-span-6 bg-white rounded-md px-10">
            <CardHeader>
              <CardTitle className="text-md font-semibold mt-6">Acciones de administración en el sistema</CardTitle>
              <CardDescription>Administre la configuración principal de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="mt-0 gap-x-0 px-0 mx-2 items-center" >
                <SearchConfigs isOpen={showModal} onClose={() => { }} items={dataFlags} setConfigs={setDataFlags} disabled={false} val={valConfig} >
                  <div className="relative left-6 mt-1">
                  </div>
                </SearchConfigs>
              </div>
              {dataFlags?.map((flag: any, index) => (
                <div key={index + 1} className="flex items-center justify-between space-x-4 border-b-2 py-4">
                  <Label htmlFor="necessary" className="flex flex-col space-y-1">
                    <span className="flex items-center">
                      <CheckIcon className="h-7 w-7 text-gray-500 hover:text-gray-700 cursor-pointer mt-1" />{flag.name}
                    </span>
                    <span className="text-xs font-normal leading-snug text-muted-foreground">
                      {flag.description}
                    </span>
                  </Label>
                  <ToggleSwitch className='mt-3' initialValue={flag.isActive} locked={false} label={''} handleChange={() => {
                    handlerChangeStatusConfig(flag);
                  }} />
                </div>
              ))}
            </CardContent>
            <CardFooter>
            </CardFooter>
          </Card>
          <Card className="col-span-6 bg-white rounded-md px-10">
            <CardHeader>
              <CardTitle className="text-md font-semibold mt-6">Acciones de administración en el sistema</CardTitle>
              <CardDescription>Administre la configuración principal de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between space-x-4 border-b-2 py-4">
                <Label htmlFor="performance" className="flex flex-col space-y-1">
                  <span>Copia de seguridad</span>
                  <span className="text-xs font-normal leading-snug text-muted-foreground">
                    Genere una copia de seguridad de las bases de datos principales del sistema
                  </span>
                </Label>
                <div className="relative sm:col-span-3">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                    <BackspaceIcon name="previewParticipant" className="h-6 w-8 text-white" color="#FFFFFF" />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowModalBackups(true) }}
                    className={`w-full bg-green-500 hover:bg-green-600 rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                  >
                    Generar backup
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-4 border-b-2 py-4">
                <Label htmlFor="performance" className="flex flex-col space-y-1">
                  <span>Reiniciar datos en el sistema</span>
                  <span className="text-xs font-normal leading-snug text-muted-foreground">
                    Limpie los datos en las colecciones principales de la base de datos (Solo en ambientes de prueba)
                  </span>
                </Label>
                <div className="relative sm:col-span-3">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                    <RouteOffIcon name="previewParticipant" className="h-6 w-8 text-white" color="#FFFFFF" />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowModal(true) }}
                    className={`w-full bg-red-500 hover:bg-red-600 rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                  >
                    Reiniciar datos
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-4 border-b-2 py-4">
                <Label htmlFor="performance" className="flex flex-col space-y-1">
                  <span> Generar notificaciones</span>
                  <span className="text-xs font-normal leading-snug text-muted-foreground">
                    Generar notificaciones en el sistema con el estado actual del sistema.
                  </span>
                </Label>
                <div className="relative col-span-6">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                    <BellElectricIcon name="previewParticipant" className="h-6 w-8 text-white" color="#FFFFFF" />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowModalNotification(true) }}
                    className={`w-full bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                  >
                    Generar notificaciones
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 border-b-2 pt-4">
                <div className="flex items-center justify-between space-x-4 py-0">
                  <Label htmlFor="performance" className="flex flex-col space-y-1">
                    <span>Sincronizar datos en DB</span>
                    <span className="text-xs font-normal leading-snug text-muted-foreground">
                      Sincronice la información entre bases de datos
                    </span>
                  </Label>
                  <div className="relative sm:col-span-3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                      <FolderSyncIcon name="previewParticipant" className="h-6 w-8 text-white" color="#FFFFFF" />
                    </div>
                  </div>
                </div>
                <Accordion id="participants" type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="hover:text-gray-600">Datos de conexión</AccordionTrigger>
                    <AccordionContent>
                      <div data-tour="step-8" className="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-12">
                        <div className="sm:col-span-5">
                          <label htmlFor="databaseNameClient" className="flex items-center text-sm font-semibold leading-6 mb-2 text-gray-900">
                            <ArrowBigRightDashIcon className="h-5 w-4 text-gray-500 mr-1" /> Url de conexión a la BD
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="databaseNameClient"
                              id="databaseNameClient"
                              value={databaseNameClient}
                              onChange={(e) => setDatabaseNameClient(e.target.value)}
                              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="collectionNameClient" className="flex items-center text-sm font-semibold leading-6 mb-2 text-gray-900">
                            <ArrowBigRightDashIcon className="h-5 w-4 text-gray-500 mr-1" />Nombre de tabla
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="collectionNameClient"
                              id="collectionNameClient"
                              value={collectionNameClient}
                              onChange={(e) => setCollectionNameClient(e.target.value)}
                              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="stringUserClient" className="flex items-center text-sm font-semibold leading-6 mb-2 text-gray-900">
                            <ArrowBigRightDashIcon className="h-5 w-4 text-gray-500 mr-1" /> Usuario
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="stringUserClient"
                              id="stringUserClient"
                              autoComplete="off"
                              value={stringUserClient}
                              onChange={(e) => setStringUserClient(e.target.value)}
                              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="stringKeyClient" className="flex items-center text-sm font-semibold leading-6 mb-2 text-gray-900">
                            <ArrowBigRightDashIcon className="h-5 w-4 text-gray-500 mr-1" /> Contraseña
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="stringKeyClient"
                              id="stringKeyClient"
                              value={stringKeyClient}
                              autoComplete="off"
                              onChange={(e) => setStringKeyClient(e.target.value)}
                              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

            </CardContent>
            <CardFooter>
              <div className="grid grid-cols gap-3 mt-4">
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                    <DoorClosedIcon name="previewParticipant" className="h-6 w-8 text-white" color="#FFFFFF" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeTabWithRefresh(`/administración`, refreshData);
                    }}
                    disabled={false}
                    className={`bg-green-600 hover:bg-green-800 w-full rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                  >
                    Salir
                  </button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="dashboard" className="space-y-4">
        <LogsDashboardChart />
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <LogsTable />
      </TabsContent>
      <TabsContent value="audit" className="space-y-4">
        <AuditLogComponent />
        <div className="rounded-md bg-white shadow-md text-2xl font-semibold p-4">
          <ClientIp />
        </div>
      </TabsContent>
      <TabsContent value="ideas" className="space-y-4">
        <div className="bg-white rounded-md shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Ideas del Sistema</h2>
            <span className="text-sm text-gray-500">{ideasData.length} ideas</span>
          </div>

          {ideasLoading ? (
            <p className="text-sm text-gray-400 py-8 text-center">Cargando ideas...</p>
          ) : ideasData.length > 0 ? (
            <div className="space-y-4">
              {/* Tarjetas de resumen - filtrables */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  className={`p-3 rounded-lg text-center cursor-pointer transition-all hover:shadow-md ${
                    ideasFilter === null ? 'bg-gray-100 ring-2 ring-gray-400' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setIdeasFilter(null)}
                  title="Ver todas las ideas"
                >
                  <p className="text-2xl font-bold text-gray-800">{ideasData.length}</p>
                  <p className="text-xs text-gray-500">Total ideas</p>
                </div>
                <div
                  className={`p-3 rounded-lg text-center cursor-pointer transition-all hover:shadow-md ${
                    ideasFilter === 'pendiente' ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-amber-50 hover:bg-amber-100'
                  }`}
                  onClick={() => setIdeasFilter('pendiente')}
                  title="Filtrar por pendientes"
                >
                  <p className="text-2xl font-bold text-amber-600">
                    {ideasData.filter((i: any) => i.estado === 'pendiente').length}
                  </p>
                  <p className="text-xs text-amber-600">⏳ Pendientes</p>
                </div>
                <div
                  className={`p-3 rounded-lg text-center cursor-pointer transition-all hover:shadow-md ${
                    ideasFilter === 'en_desarrollo' ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => setIdeasFilter('en_desarrollo')}
                  title="Filtrar por en desarrollo"
                >
                  <p className="text-2xl font-bold text-blue-600">
                    {ideasData.filter((i: any) => i.estado === 'en_desarrollo').length}
                  </p>
                  <p className="text-xs text-blue-600">🔄 En desarrollo</p>
                </div>
                <div
                  className={`p-3 rounded-lg text-center cursor-pointer transition-all hover:shadow-md ${
                    ideasFilter === 'desarrollada' ? 'bg-green-100 ring-2 ring-green-400' : 'bg-green-50 hover:bg-green-100'
                  }`}
                  onClick={() => setIdeasFilter('desarrollada')}
                  title="Filtrar por desarrolladas"
                >
                  <p className="text-2xl font-bold text-green-600">
                    {ideasData.filter((i: any) => i.estado === 'desarrollada').length}
                  </p>
                  <p className="text-xs text-green-600">✅ Desarrolladas</p>
                </div>
              </div>

              {/* Indicador de filtro activo */}
              {(ideasFilter || prioridadFilter) ? (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Mostrando <strong>{filteredIdeas.length}</strong> de <strong>{ideasData.length}</strong> ideas</span>
                  <span className="text-gray-300">|</span>
                  {ideasFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {ideasFilter === 'pendiente' ? '⏳ Pendiente' :
                       ideasFilter === 'en_desarrollo' ? '🔄 En desarrollo' :
                       '✅ Desarrollada'}
                    </span>
                  )}
                  {prioridadFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {prioridadFilter === 'alta' ? '🔴 Alta' :
                       prioridadFilter === 'media' ? '🟡 Media' :
                       '🟢 Baja'}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 underline ml-1"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : null}

              {/* Prioridades - filtrables */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 mr-1 self-center">Por prioridad:</span>
                {['alta', 'media', 'baja'].map((p) => {
                  const count = ideasData.filter((i: any) => i.prioridad === p).length;
                  const textColor: Record<string, string> = {
                    alta: '#991b1b',
                    media: '#92400e',
                    baja: '#166534',
                  };
                  const activeBg: Record<string, string> = {
                    alta: '#fecaca',
                    media: '#fed7aa',
                    baja: '#bbf7d0',
                  };
                  const inactiveBg: Record<string, string> = {
                    alta: '#fef2f2',
                    media: '#fffbeb',
                    baja: '#f0fdf4',
                  };
                  const isActive = prioridadFilter === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPrioridadFilter(isActive ? null : p)}
                      style={{
                        backgroundColor: isActive ? activeBg[p] : inactiveBg[p],
                        color: textColor[p],
                        border: isActive ? '2px solid transparent' : '1px solid transparent',
                        boxShadow: isActive ? `0 0 0 2px ${textColor[p]}40` : 'none',
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer hover:brightness-95"
                    >
                      {p === 'alta' ? '🔴' : p === 'media' ? '🟡' : '🟢'} {p}: {count}
                    </button>
                  );
                })}
              </div>

              {/* Tabla paginada de ideas */}
              <div className="overflow-x-auto" id="ideas-table">
                <table className="rounded-lg min-w-full text-left text-sm">
                  <thead className="uppercase tracking-wider border-b-2">
                    <tr>
                      <th className="px-2 py-3 w-14">ID</th>
                      <th className="px-2 py-3 w-3/4">Descripción</th>
                      <th className="px-2 py-3 w-14">Prioridad</th>
                      <th className="px-2 py-3 w-20">Estado</th>
                      <th className="px-2 py-3 w-14">Creada</th>
                      <th className="px-2 py-3 w-10 text-center">Acc.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredIdeas.length > 0 ? (
                      filteredIdeas
                        .slice((ideasPage - 1) * IDEAS_PAGE_SIZE, ideasPage * IDEAS_PAGE_SIZE)
                        .map((idea: any) => (
                          <tr
                            key={idea.id}
                            className="border-b hover:bg-blue-50 cursor-pointer"
                            onDoubleClick={() => setDetailIdea(idea)}
                          >
                            <td className="px-2 py-2 font-mono text-gray-700 text-xs whitespace-nowrap">{idea.id}</td>
                            <td className="px-2 py-2 text-gray-800 break-words w-3/4">{idea.descripcion}</td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                idea.prioridad === 'alta' ? 'bg-red-100 text-red-700' :
                                idea.prioridad === 'media' ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {idea.prioridad}
                              </span>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                idea.estado === 'pendiente' ? 'bg-gray-100 text-gray-700' :
                                idea.estado === 'en_desarrollo' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {idea.estado === 'pendiente' ? '⏳ Pendiente' :
                                 idea.estado === 'en_desarrollo' ? '🔄 En desarrollo' :
                                 '✅ Desarrollada'}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">
                              {idea.fechas?.creacion
                                ? new Date(idea.fechas.creacion).toLocaleDateString('es-CO', {
                                    year: 'numeric', month: 'short', day: 'numeric'
                                  })
                                : '-'}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); setDetailIdea(idea); }}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4 inline-block" />
                              </button>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          No hay ideas con ese estado
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {(() => {
                const ideasTotalPages = Math.ceil(filteredIdeas.length / IDEAS_PAGE_SIZE);
                return ideasTotalPages > 1 ? (
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      Página {ideasPage} de {ideasTotalPages}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIdeasPage((p) => Math.max(1, p - 1))}
                        disabled={ideasPage === 1}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Anterior
                      </button>
                      {Array.from({ length: ideasTotalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setIdeasPage(page)}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            page === ideasPage
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setIdeasPage((p) => Math.min(ideasTotalPages, p + 1))}
                        disabled={ideasPage === ideasTotalPages}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 pt-3 border-t">{filteredIdeas.length} ideas</div>
                );
              })()}

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIdeasLoading(true);
                    const result = await getAllIdeas(1, 500);
                    if (result?.data) setIdeasData(result.data);
                    setIdeasLoading(false);
                    setIdeasPage(1);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ↻ Recargar
                </button>
                <button
                  type="button"
                  onClick={() => { router.push('/feedback/feedback-table'); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Ir a Feedback
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No hay ideas registradas en el backlog.</p>
              <button
                type="button"
                onClick={async () => {
                  setIdeasLoading(true);
                  const result = await getAllIdeas(1, 500);
                  if (result?.data) setIdeasData(result.data);
                  setIdeasLoading(false);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ↻ Recargar
              </button>
            </div>
          )}

          {/* Modal de detalle de idea */}
          {detailIdea && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetailIdea(null)}>
              <div
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Detalle de la idea</h3>
                    <button
                      onClick={() => setDetailIdea(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Contenido */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">ID</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{detailIdea.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Prioridad</p>
                        <p className="text-sm font-medium">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            detailIdea.prioridad === 'alta' ? 'bg-red-100 text-red-700' :
                            detailIdea.prioridad === 'media' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {detailIdea.prioridad}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Estado</p>
                        <p className="text-sm font-medium">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            detailIdea.estado === 'pendiente' ? 'bg-gray-100 text-gray-700' :
                            detailIdea.estado === 'en_desarrollo' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {detailIdea.estado === 'pendiente' ? '⏳ Pendiente' :
                             detailIdea.estado === 'en_desarrollo' ? '🔄 En desarrollo' :
                             '✅ Desarrollada'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Creada</p>
                        <p className="text-sm font-medium text-gray-900">
                          {detailIdea.fechas?.creacion
                            ? new Date(detailIdea.fechas.creacion).toLocaleString('es-CO', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })
                            : '-'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Descripción</p>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{detailIdea.descripcion || 'Sin descripción'}</p>
                    </div>

                    {detailIdea.detalle && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Detalle</p>
                        <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detailIdea.detalle}</p>
                      </div>
                    )}

                    {detailIdea.tags?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Tags</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {detailIdea.tags.map((tag: string, i: number) => (
                            <span key={i} className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Última modificación</p>
                      <p className="text-sm text-gray-900">
                        {detailIdea.fechas?.modificacion
                          ? new Date(detailIdea.fechas.modificacion).toLocaleString('es-CO', {
                              year: 'numeric', month: 'long', day: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Botón cerrar */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => setDetailIdea(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>

    <Modal isOpen={showModal} onClose={() => { setShowModal(false) }} classSize='max-w-md'>
      <div className="border-b border-gray-900/10 pb-12">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full flex items-center">
            <InformationCircleIcon name="mail" className="h-6 w-10 text-red-500" />
            <p className="text-gray-500">{t('common.youWantToPerformThisAction')}</p>
          </div>
          <div className="col-span-full text-sm">
            <p className="text-gray-500">Esta acción borra todos los datos de coleciones dinámicas del sistema. Por favor, uselo solo en un ambiente de pruebas.</p>
            <p className="text-gray-500 font-semibold">Si, para aplicar. </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-x-6">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
            <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
          </div>
          <button onClick={() => { setShowModal(false) }} type="button" className="bg-gray-500 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
            Cancelar
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
            <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
          </div>

          <button
            onClick={handleChangeSoftDelete}
            className={`rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
          >
            {t('common.yes')}
          </button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={showModalBackups} onClose={() => { setShowModalBackups(false) }} classSize='max-w-md'>
      <div className="border-b border-gray-900/10 pb-12">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full flex items-center">
            <InformationCircleIcon name="mail" className="h-6 w-10 text-blue-500" />
            <p className="text-gray-500">{t('common.youWantToPerformThisAction')}</p>
          </div>
          <div className="col-span-full text-sm">
            <p className="text-gray-500">Esta acción genera una copia de seguridad de la base de datos del sistema.</p>
            <p className="text-gray-500 font-semibold">Si, para generar. </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-x-6">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
            <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
          </div>
          <button onClick={() => { setShowModalBackups(false) }} type="button" className="bg-gray-500 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
            Cancelar
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
            <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
          </div>

          <button
            onClick={handleChangeGenerateBackups}
            className={`rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
          >
            {t('common.yes')}
          </button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={showModalNotification} onClose={() => { setShowModalNotification(false) }} classSize='max-w-md'>
      <div className="border-b border-gray-900/10 pb-12">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full flex items-center">
            <InformationCircleIcon name="mail" className="h-6 w-10 text-blue-500" />
            <p className="text-gray-500">{t('common.youWantToPerformThisAction')}</p>
          </div>
          <div className="col-span-full text-sm">
            <p className="text-gray-500">Esta acción genera notificaciones generales para todas las novedades en participaciones que no han sido notificadas previamente.</p>
            <p className="text-gray-500 font-semibold">Si, para generar notificaciones. </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-x-6">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
            <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
          </div>
          <button onClick={() => { setShowModalNotification(false) }} type="button" className="bg-gray-500 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
            Cancelar
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
            <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
          </div>

          <button
            onClick={handleChangeGenerateNotifications}
            className={`rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
          >
            {t('common.yes')}
          </button>
        </div>
      </div>
    </Modal>

    {isLoading && <div className="loading-container"><Loading /></div>}
  </div >
  )
}
