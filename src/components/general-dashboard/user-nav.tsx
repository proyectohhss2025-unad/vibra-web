import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/new-york/ui/avatar"
import { Button } from "@/registry/new-york/ui/button"
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
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`/avatars/${user?.avatar}`} alt="avatarUser" />
            <AvatarFallback>{user?.username}</AvatarFallback>
          </Avatar>
        </Button>
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
          <DropdownMenuItem>
            Configuración
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Cambiar de usuario</DropdownMenuItem>
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
