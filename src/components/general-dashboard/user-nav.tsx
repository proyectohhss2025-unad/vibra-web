import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu"
import { AuthContext } from "@/services/auth";
import { getSafeKeyObjectFromStorage } from "@/utils/safe-token-storage";
import { useRouter } from "next/router";
import { useTabs } from "@/services/contexts/tabs-context";
import { AdminCookieSettings } from "@/components/admin/cookie-settings";
import { Cog } from "lucide-react";
import ProfileComponent from "./profile";
import { useContext, useEffect, useState } from "react";

export function UserNav() {
  const user_: any = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const { token, handleLogout } = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(user_);
  const router = useRouter();
  const { openTab } = useTabs();

  useEffect(() => {
    setIsAuthenticated(!!token);
    setUser(user_);
  }, [token]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Q" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        console.log('Entro con ' + e.key);
        //setOpen((open) => !open)
        handleLogout();
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-8 w-8 rounded-full flex items-center justify-center bg-transparent hover:bg-gray-100 transition-colors border-0">
          <Cog className="h-5 w-5 !text-gray-600 hover:!text-gray-900" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 gap-y-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openTab('/Perfil', 'Perfil', <ProfileComponent />)}>
            Perfil
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          {(() => {
            const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
            return roleName?.toLowerCase() === 'super admin' ? (
              <DropdownMenuItem onClick={() => openTab('/seguridad', 'Seguridad', <AdminCookieSettings />)}>
                Configuración
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            ) : null;
          })()}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Cerrar sesión
          <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
