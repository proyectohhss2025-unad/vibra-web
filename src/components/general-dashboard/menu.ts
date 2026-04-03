import { getConfigById } from "@/api/config"
import { FilePlus2Icon, Layers3Icon, ListCheckIcon, ReceiptIcon } from "lucide-react"
import EmotionComponent from "../emotion/emotion";

const getStateConfigFlag = async (configId: string): Promise<boolean> => {
    try {
        const response: any = await getConfigById(configId);
        return !!response?.isActive;
    } catch (error) {
        return false;
    }
}

export const componentsTransactionsModule = [
    {
        id: "Emociones",
        title: "Emociones",
        label: "Panel de emociones",
        href: "#",
        description: "Clic para ir al panel general de emociones",
        component: EmotionComponent,
        icon: ReceiptIcon,
        isActive: await getStateConfigFlag('67781bb2f426d18e161d1345') || false
    },
    {
        id: "Actividades",
        title: "Actividades",
        label: "Nueva actividad",
        href: "#",
        description: "Clic para ingresar una nueva actividad",
        component: EmotionComponent,
        icon: FilePlus2Icon,
        isActive: await getStateConfigFlag('67781bb2f426d18e161d1345') || false
    },
]

export const componentsTasksModule = [
    {
        id: "Tareas",
        title: "Tareas",
        label: "Sabana de tareas",
        href: "#",
        description: "Clic para ir a la sabana general de tareas",
        component: EmotionComponent,
        icon: Layers3Icon,
        isActive: true
    },
    {
        id: "Notificaciones",
        title: "Notificaciones",
        label: "Lista general de notificaciones",
        href: "#",
        description: "Clic para ir al listado general de notificaciones",
        component: EmotionComponent,
        icon: ListCheckIcon,
        isActive: true
    },
]