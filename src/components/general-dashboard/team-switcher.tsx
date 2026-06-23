"use client"

import { SearchIcon, ExternalLinkIcon } from "lucide-react"
import * as React from "react"
import { useState, useEffect, useContext } from "react"
import { getAllParticipants } from "@/api/participant"
import {
  Avatar,
  AvatarFallback,
} from "@/registry/new-york/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"
import { Button } from "@/registry/new-york/ui/button"
import { AuthContext } from "@/services/auth"
import { useRouter } from "next/router"
import { useTabs } from "@/services/contexts/tabs-context"
import UserProfilePage from "@/components/reports/user-profile-page"

export default function TeamSwitcher() {
  const { openTab } = useTabs();
  const { token, user, mainCompany, resolvedPermissions } = useContext(AuthContext);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    if (!token) {
      router.push("/layout");
      return;
    }
    const isAdmin = resolvedPermissions?.isSuperAdmin || (user?.role as any)?.name === "Administrador";
    const companyId = isAdmin ? undefined : mainCompany?._id || (user?.company as any)?._id;
    getAllParticipants(1, 100, companyId).then(({ participants: data }) => {
      setParticipants(data || []);
    });
  }, [token, router]);

  const filtered = participants.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const goToProfile = (participant: any) => {
    const userId = participant.userId;
    if (!userId) return;
    setOpen(false);
    openTab(
      `/perfil/${userId}`,
      `Perfil: ${participant.name}`,
      <UserProfilePage userId={userId} userName={participant.name} />
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="ml-2 w-[260px] justify-between text-sm text-gray-500"
        >
          <SearchIcon className="h-4 w-4 mr-1" />
          Buscar participante...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <input
            autoFocus
            type="text"
            placeholder="Nombre del participante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400">
              {search ? "No se encontraron participantes" : "Escribe para buscar..."}
            </div>
          ) : (
            <ul className="py-1">
              {filtered.map((p: any) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => goToProfile(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors text-left"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                        {p.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{p.name}</div>
                      {p.documentNumber && (
                        <div className="text-xs text-gray-400">Doc: {p.documentNumber}</div>
                      )}
                    </div>
                    <ExternalLinkIcon className="h-4 w-4 text-gray-300 hover:text-blue-500 flex-shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
