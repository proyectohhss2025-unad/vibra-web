"use client"

import { useToast } from "@/registry/new-york/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/registry/new-york/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <ToastViewport className="mt-0 right-[10rem] z-50" style={{ top: "0vh", right: "36vw" }} />
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast className="mt-2 bg-blue-200 rounded shadow-lg right-[20rem]" key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
    </ToastProvider>
  )
}
