"use client"

import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons"
import * as React from "react"

import { getAllParticipants } from "@/api/participant"
import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/new-york/ui/avatar"
import { Button } from "@/registry/new-york/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/registry/new-york/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/registry/new-york/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"
import { AuthContext } from "@/services/auth"
import { getSafeKeyObjectFromStorage } from "@/utils/safe-token-storage"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { useTabs } from "@/services/contexts/tabs-context"
import { useFilter } from "@/services/contexts/filter-context"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface TeamSwitcherProps extends PopoverTriggerProps {
  getDataFilterByParticipant: () => void;
}

export default function TeamSwitcher({ className, getDataFilterByParticipant }: TeamSwitcherProps) {
  const participantSelected: any = JSON.parse(getSafeKeyObjectFromStorage('participantSelected')) ?? JSON.parse(getSafeKeyObjectFromStorage('participantSelected'));

  const { setParticipantSelected } = useTabs();
  const { setParticipantFilter } = useFilter();

  const participantAux = {
    label: "Todos los usuarios",
    value: "Todos los usuarios",
    avatar: "03.jpg",
    _id: 'all'
  };
  const { token } = useContext(AuthContext);
  const [open, setOpen] = React.useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false)

  const [groups, setGroups] = React.useState<any>([{
    label: "",
    teams: [participantAux],
  }]);

  const [selectedTeam, setSelectedTeam] = useState<any>(participantSelected ?? participantAux);
  const [countData, setCountData] = useState(1);
  const router = useRouter();

  useEffect((): any => {
    setSelectedTeam(participantSelected ?? participantAux);
    setParticipantFilter(participantSelected ?? participantAux);
  }, []);

  useEffect((): any => {
    console.log('selectedTeam: ', selectedTeam);

    if (!token) {
      router.push('/layout');
    }

    const fetchData = async () => {
      const { participants, count } = await getAllParticipants(1, 50);
      let newGroups: any = [];
      participants?.forEach((participant: any) => {
        newGroups.push({
          label: participant.name,
          value: participant.nit,
          avatar: participant.avatar,
          _id: participant._id,
          epsCode: participant.epsCode,
          regime: participant.regime
        });
      });

      setGroups([...groups, {
        label: "Todos los usuarios",
        teams: newGroups,
      }]);

      setCountData(count);
    }

    fetchData();
  }, [token, router]);


  useEffect((): any => {
    getDataFilterByParticipant();
  }, [selectedTeam]);

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="hover:text-gray-600">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn("w-[260px] justify-between", className)}
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`/avatars/${selectedTeam?.avatar}`}
                alt={selectedTeam?.label}
                className="grayscale"
              />
              <AvatarFallback>{selectedTeam?.label}</AvatarFallback>
            </Avatar>
            {selectedTeam?.label}
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0">
          <Command>
            <CommandInput placeholder="Busqueda ..." />
            <CommandList>
              <CommandEmpty>No se ha encontrado un usuario</CommandEmpty>
              <div style={{ height: "50vh", overflowY: "auto" }}>
                {groups?.map((group: any, index: number) => (
                  <CommandGroup key={`${group._id}_${index}`} heading={group.label}>
                    {group?.teams?.map((team: any) => (
                      <CommandItem
                        key={`${team?.value}_${index}`}
                        onSelect={() => {
                          setSelectedTeam(team);
                          localStorage.setItem('participantSelected', JSON.stringify(team));
                          setParticipantFilter(team);
                          //setOpen(false)
                          setParticipantSelected(team);
                        }}
                        className="text-sm"
                      >
                        <Avatar className="mr-2 h-5 w-5">
                          <AvatarImage
                            src={`/avatars/${team?.avatar}`}
                            alt={team?.label}
                            className="grayscale"
                          />
                          <AvatarFallback>{team?.avatar}</AvatarFallback>
                        </Avatar>
                        {team?.label}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedTeam?.value === team?.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </div>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewTeamDialog(true)
                    }}
                  >
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Crear nuevo participante
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo participante</DialogTitle>
          <DialogDescription>
            Agregue un nuevo participante para gestionar participaciones.
          </DialogDescription>
        </DialogHeader>
        <div className="mr-2">
          {/*<AddParticipant nitParticipant={'0'} onClose={() => setShowNewTeamDialog(false)} />*/}
        </div>
      </DialogContent>
    </Dialog>
  )
}
