import { getCountAllNotificationsByDay } from "@/api/notification"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/new-york/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/new-york/ui/hover-card"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/registry/new-york/ui/navigation-menu"
import { useDevice } from "@/services/contexts/device-context"
import { useTabs } from "@/services/contexts/tabs-context"
import { CalendarIcon } from "@heroicons/react/solid"
import { CalendarCogIcon, DatabaseBackupIcon, HomeIcon, Wallet } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import GeneralDashboardComponent from "../general-dashboard"
import NotificationTray from "../notification-tray"
//import DashboardReports from "../reports/dashboard-reports"
import CurrentDateTime from "../utils/current-datetime"

type MainProps = {
  className: string;
}

export default function MainNav({ className }: MainProps) {
  const { openTab } = useTabs();
  const [totalNotificationsToday, setTotalNotificationsToday] = useState(0);
  const [totalReportsGeneratedToday, setTotalReportsGeneratedToday] = useState(0);
  const { isMobile, isTablet } = useDevice();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        //console.log('Entro con ' + e.key);
        //setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    getCountAllNotificationsByDay()
      .then(data => setTotalNotificationsToday(data?.countNotifications));
  }, []);

  /*useEffect(() => {
    getAllByDay(1, 50)
      .then(data => setTotalReportsGeneratedToday(data?.length));
  }, []);*/

  return (
    <nav
      className={cn("md:flex items-center space-x-2 lg:space-x-4", className)}
    >
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Inicio</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-[340px] md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild className="bg-blue-200">
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md"
                      href="#"
                    >
                      <HomeIcon className="max-h-12 max-w-12 min-h-12 min-w-12 mt-0" />
                      <div className="mb-2 mt-4 text-lg font-medium" onClick={() => {
                        openTab(
                          `Inicio`,
                          "Inicio",
                          <GeneralDashboardComponent />
                        );
                      }}>
                        Inicio
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Panel general de participaciones.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="#" title="Notificaciones de participaciones" onClick={() => {
                  /*openTab(
                    `Informes`,
                    "Informes",
                    <DashboardReports />
                  );*/
                }} >
                  <div className="flex items-center">
                    <Wallet className="max-h-8 max-w-8 min-h-8 min-w-8 mr-2" />
                    Informes y reportes
                  </div>
                </ListItem>
                <ListItem href="#" title="Copias de seguridad" onClick={() => {
                  openTab(
                    `Notificaciones`,
                    "Notificaciones",
                    <NotificationTray />
                  );
                }}>
                  <div className="flex items-center">
                    <DatabaseBackupIcon className="max-h-8 max-w-8 min-h-8 min-w-8 mr-2" />
                    Notificaciones de copias de seguridad realizadas por Jobs
                  </div>
                </ListItem>
                <ListItem href="#" title="Alertas de actividades" onClick={() => {
                  openTab(
                    `Notificaciones`,
                    "Notificaciones",
                    <NotificationTray />
                  );
                }}>
                  <div className="flex items-center">
                    <CalendarCogIcon className="font-medium max-h-8 max-w-8 min-h-8 min-w-8 mr-2" />
                    Alertas de actividades
                  </div>
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Acciones</NavigationMenuTrigger>
            <NavigationMenuContent>
              {/*<ul className="grid gap-3 p-4 w-[340px] md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {componentsTasksModule.map((component: any) => (
                  component.isActive && <ListItem
                    key={`T${component.id}`}
                    title={component.label}
                    href={component.href}
                    onClick={() => {
                      openTab(
                        `/${component.id}`,
                        `${component.title}`,
                        <component.component />
                      );
                    }}
                  >
                    <div className="flex items-center">
                      <component.icon className="max-h-8 max-w-8 min-h-8 min-w-8 mr-2" />
                      {component.description}
                    </div>
                  </ListItem>
              ))}
              </ul>*/}
            </NavigationMenuContent>
          </NavigationMenuItem>
          {/*<NavigationMenuItem>
            <NavigationMenuTrigger>Participaciones</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-[340px] md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {componentsTransactionsModule.map((component: any) => (
                  component.isActive && <ListItem
                    key={`T${component.id}`}
                    title={component.label}
                    href={component.href}
                    onClick={() => {
                      openTab(
                        `/${component.id}`,
                        `${component.title}`,
                        <component.component />
                      );
                    }}
                  >
                    <div className="flex items-center">
                      <component.icon className="max-h-8 max-w-8 min-h-8 min-w-8 mr-2" />
                      {component.description}
                    </div>
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>*/}
        </NavigationMenuList>
      </NavigationMenu>
      {!isMobile && <div className="gap-x-1">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link
              href="#"
              className="text-sm mx-1 text-muted-foreground transition-colors hover:text-secondary text-white bg-blue-500 rounded-md p-2 px-2 hover:text-white font-medium"
              onClick={() => {
                openTab(
                  `Notificaciones`,
                  "Notificaciones",
                  <NotificationTray />
                );
              }}
            >
              Notificaciones
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4" >
              <Avatar>
                <AvatarImage src="/avatars/05.jpg" />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Ultimas notificaciones</h4>
                <p className="text-sm">
                  Durante el día se han creado {totalNotificationsToday} notificaciones de participaciones.
                </p>
                <div className="flex items-center pt-2">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    <CurrentDateTime format="LL" />
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link
              href="#"
              className="text-sm mx-1 text-muted-foreground transition-colors hover:text-secondary text-white bg-blue-500 rounded-md p-2 px-2 hover:text-white font-medium"
              onClick={() => {
                /*openTab(
                  `Informes`,
                  "Informes",
                  <DashboardReports />
                );*/
              }}>
              Informes
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <Avatar>
                <AvatarImage src="/avatars/05.jpg" />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Actualidad</h4>
                <p className="text-sm">
                  En el día se han generado {totalReportsGeneratedToday} {totalReportsGeneratedToday > 1 || totalReportsGeneratedToday === 0 ? "informes" : "informe"}
                </p>
                <div className="flex items-center pt-2">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    <CurrentDateTime format="LL" />
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>}
    </nav>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm flex items-center font-medium leading-none mr-3"> {title}</div>
          <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"