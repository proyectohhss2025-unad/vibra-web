"use client"

import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format } from "date-fns"
import * as React from "react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york/ui/button"
import { Calendar } from "@/registry/new-york/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"
import { FORMAT_DATE_SHORT } from "@/utils/constants"
import { formatDate, subtractDaysToDate } from "@/utils/dates"
import { useEffect } from "react"
import { getSafeKeyFromStorage } from "@/utils/safe-token-storage"

interface Props {
  disabled: boolean;
  setIsRange: (value: any) => void;
  setSelectedDate: (date: any) => void;
}

const CalendarDateRangePicker: React.FC<Props> = ({ disabled, setIsRange, setSelectedDate }) => {

  const dateFilterFrom: any = getSafeKeyFromStorage('dateFilterFrom');
  const dateFilterTo: any = getSafeKeyFromStorage('dateFilterTo');

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: dateFilterFrom ?? subtractDaysToDate(new Date(), 20),
    to: dateFilterTo ?? addDays(new Date(), 20),
  })

  useEffect((): any => {
    localStorage.setItem('dateFilterFrom', formatDate(date?.from ?? new Date(), FORMAT_DATE_SHORT));
    localStorage.setItem('dateFilterTo', formatDate(date?.to ?? new Date(), FORMAT_DATE_SHORT));
    setSelectedDate(date);
    setIsRange(true);
  }, [date]);

  return (
    <div className="flex items-center gap-2 hover:text-gray-700">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            id="date"
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal hover:text-gray-700",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {
        /*
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <RefreshCwIcon className="mr-2 h-4 w-4 cursor-pointer" onClick={() => { setIsRange(false) }} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Click para activar el filtro por año.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        */
      }
    </div>
  )
}

export default CalendarDateRangePicker;