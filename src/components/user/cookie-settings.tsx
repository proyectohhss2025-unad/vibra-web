"use client"

import { deleteAllDocumentsByTest, startGenerateBackups } from "@/api/admin"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"
import { Label } from "@/registry/new-york/ui/label"
import { useTranslation } from 'react-i18next';
import { ArrowCircleLeftIcon, BackspaceIcon, InformationCircleIcon, SaveAsIcon } from "@heroicons/react/outline"
import { DoorClosedIcon, RouteOffIcon } from "lucide-react"
import { useState } from "react"
import ToggleSwitch from "../forms/toggleSwitch"
import Modal from "../layouts/modal/modal"
import CurrentDateTime from "../utils/current-datetime"

export function UserCookieSettings() {
  const { t } = useTranslation();
  const [debitNoteId_, setDebitNoteId_] = useState<any>('');
  const [activityIsInternal, setActivityIsInternal] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = (config: any) => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChangeSoftDelete = async () => {
    try {
      const deleteResponse = await deleteAllDocumentsByTest();
      if (deleteResponse) {
        handleCloseModal();
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleChangeGenerateBackups = async () => {
    try {
      const response = await startGenerateBackups();
      if (response) {
        handleCloseModal();
      }
    } catch (error) {
      console.log(error.message);
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
    <Card className="bg-white rounded-md px-10">
      <CardHeader>
        <CardTitle className="text-md font-semibold mt-6">Acciones de administración en el sistema</CardTitle>
        <CardDescription>Administre la configuración principal de la aplicación.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="necessary" className="flex flex-col space-y-1">
            <span>Visualizar usuarios en línea</span>
            <span className="text-xs font-normal leading-snug text-muted-foreground">
              Activar para ver usuarios en línea en la barra principal de navegación en la parte izquierda.
            </span>
          </Label>
          <ToggleSwitch className='mt-3' initialValue={activityIsInternal} locked={debitNoteId_} label={''} handleChange={() => { setActivityIsInternal(!activityIsInternal) }} />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="performance" className="flex flex-col space-y-1">
            <span>Copia de seguridad</span>
            <span className="text-xs font-normal leading-snug text-muted-foreground">
              Genere una copia de seguridad de las bases de datos principales del sistema
            </span>
          </Label>
          <div className="relative sm:col-span-3">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
              <BackspaceIcon name="previewActivity" className="h-6 w-8 text-white" color="#FFFFFF" />
            </div>
            <button
              type="button"
              onClick={handleChangeGenerateBackups}
              className={`w-full bg-green-500 hover:bg-green-600 rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
            >
              Generar backup
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="performance" className="flex flex-col space-y-1">
            <span>Copia de seguridad</span>
            <span className="text-xs font-normal leading-snug text-muted-foreground">
              Limpie los datos en las colecciones principales de la base de datos
            </span>
          </Label>
          <div className="relative sm:col-span-3">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
              <RouteOffIcon name="previewActivity" className="h-6 w-8 text-white" color="#FFFFFF" />
            </div>
            <button
              type="button"
              onClick={() => { setShowModal(true) }}
              className={`w-full bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
            >
              Reiniciar datos
            </button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid grid-cols mt-4 gap-6">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
              <DoorClosedIcon name="previewActivity" className="h-6 w-8 text-white" color="#FFFFFF" />
            </div>
            <button
              type="button"
              onClick={() => {
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
    <Modal isOpen={showModal} onClose={handleCloseModal} classSize='max-w-md'>
      <div className="border-b border-gray-900/10 pb-12">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full flex items-center">
            <InformationCircleIcon name="mail" className="h-6 w-10 text-red-500" />
            <p className="text-gray-500">{t('common.youWantToPerformThisAction')}</p>
          </div>
          <div className="col-span-full text-sm">
            <p className="text-gray-500">Esta acción borra todos los datos de colleciones dinámicas del sistema. Por favor, uselo solo en un ambiente de pruebas.</p>
            <p className="text-gray-500 font-semibold">Si, para aplicar. </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-x-6">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
            <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
          </div>
          <button onClick={handleCloseModal} type="button" className="bg-gray-500 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
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
  </div >
  )
}
