"use client"

import { deleteAllDocumentsByTest, getIdeasStatus, startGenerateBackups, startGenerateNotification } from "@/api/admin"
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
import { getSafeKeyFromStorage } from "@/utils/safe-token-storage"
import { ArrowCircleLeftIcon, BackspaceIcon, InformationCircleIcon, SaveAsIcon } from "@heroicons/react/outline"
import { ArrowBigRightDashIcon, BellElectricIcon, CheckIcon, DoorClosedIcon, FolderSyncIcon, RouteOffIcon } from "lucide-react"
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
  const { clientIp } = useClientIp();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [ideasStatus, setIdeasStatus] = useState<{
    ideasPath: string;
    fileExists: boolean;
    totalIdeas: number;
    lastModified: string | null;
  } | null>(null);

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

  // Load ideas.json status
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
          {/* Ideas status card */}
          <Card className="col-span-12 bg-white rounded-md px-10">
            <CardHeader>
              <CardTitle className="text-md font-semibold mt-6">
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Gestión de Ideas del Sistema
                </span>
              </CardTitle>
              <CardDescription>Backlog de ideas del proyecto Vibra</CardDescription>
            </CardHeader>
            <CardContent>
              {ideasStatus ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <span className="text-lg">📂</span>
                    <div>
                      <p className="text-xs text-gray-500">Ruta del archivo</p>
                      <p className="text-sm font-mono text-gray-700 truncate max-w-[200px]" title={ideasStatus.ideasPath}>
                        {ideasStatus.ideasPath}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <span className="text-lg">{ideasStatus.fileExists ? '✅' : '❌'}</span>
                    <div>
                      <p className="text-xs text-gray-500">Estado</p>
                      <p className={`text-sm font-medium ${ideasStatus.fileExists ? 'text-green-600' : 'text-red-600'}`}>
                        {ideasStatus.fileExists ? 'Archivo disponible' : 'No encontrado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <span className="text-lg">📝</span>
                    <div>
                      <p className="text-xs text-gray-500">Total ideas</p>
                      <p className="text-sm font-bold text-gray-700">{ideasStatus.totalIdeas}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <span className="text-lg">🕐</span>
                    <div>
                      <p className="text-xs text-gray-500">Última modificación</p>
                      <p className="text-sm text-gray-700">
                        {ideasStatus.lastModified
                          ? new Date(ideasStatus.lastModified).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Cargando información del backlog...</p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    router.push('/feedback/feedback-table');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ir a Feedback
                </button>
              </div>
            </CardContent>
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
    </Tabs>

    <Modal isOpen={showModal} onClose={() => { setShowModal(false) }} classSize='max-w-md'>
      <div className="border-b border-gray-900/10 pb-12">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full flex items-center">
            <InformationCircleIcon name="mail" className="h-6 w-10 text-red-500" />
            <p className="text-gray-500">{getSafeKeyFromStorage('You want to perform this action.')}</p>
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
            {getSafeKeyFromStorage('Yes')}
          </button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={showModalBackups} onClose={() => { setShowModalBackups(false) }} classSize='max-w-md'>
      <div className="border-b border-gray-900/10 pb-12">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full flex items-center">
            <InformationCircleIcon name="mail" className="h-6 w-10 text-blue-500" />
            <p className="text-gray-500">{getSafeKeyFromStorage('You want to perform this action.')}</p>
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
            {getSafeKeyFromStorage('Yes')}
          </button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={showModalNotification} onClose={() => { setShowModalNotification(false) }} classSize='max-w-md'>
      <div className="border-b border-gray-900/10 pb-12">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full flex items-center">
            <InformationCircleIcon name="mail" className="h-6 w-10 text-blue-500" />
            <p className="text-gray-500">{getSafeKeyFromStorage('You want to perform this action.')}</p>
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
            {getSafeKeyFromStorage('Yes')}
          </button>
        </div>
      </div>
    </Modal>

    {isLoading && <div className="loading-container"><Loading /></div>}
  </div >
  )
}
