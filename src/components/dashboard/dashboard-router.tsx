/**
 * DashboardRouter — enruta al dashboard correcto según el rol del usuario.
 *
 * Mapa centralizado de roles → componentes dashboard.
 * Para agregar un nuevo rol solo hay que añadirlo al mapa.
 *
 * Uso:
 *   <DashboardRouter roleName="Docente" />
 *   <DashboardRouter roleName="Administrador" />
 */
'use client'

import GeneralDashboardComponent from "../general-dashboard"
import TeacherDashboardComponent from "./teacher-dashboard"
import StudentDashboardComponent from "./student-dashboard"

// ─── Mapa de roles → componentes dashboard ──────────────────────────
// Agregar aquí nuevos roles cuando se creen sus dashboards.
const DASHBOARD_MAP: Record<string, React.ComponentType> = {
  Docente: TeacherDashboardComponent,
  Estudiante: StudentDashboardComponent,
}

interface DashboardRouterProps {
  roleName?: string
}

export function DashboardRouter({ roleName }: DashboardRouterProps) {
  const DashboardComponent =
    DASHBOARD_MAP[roleName ?? ''] || GeneralDashboardComponent
  return <DashboardComponent />
}
