import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogPortal({
  children,
  ...props
}: DialogPrimitive.Portal.Props) {
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal" {...props}>
      <DialogPrimitive.Backdrop
        data-slot="dialog-backdrop"
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity",
          "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        )}
      />
      {children}
    </DialogPrimitive.Portal>
  )
}

function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: DialogPrimitive.Popup.Props & { showClose?: boolean }) {
  return (
    <DialogPortal>
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-2xl border border-[#e4ddd0] bg-white p-4 text-[#2d2d2d] shadow-lg outline-none sm:p-6",
          "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 transition-all",
          className,
        )}
        {...props}
      >
        {children}

        {showClose && (
          <DialogClose
            className="absolute top-4 right-4 rounded-md p-1 text-[#999999] outline-none transition-colors hover:bg-[#f5f1e8] hover:text-[#2d2d2d] focus-visible:ring-2 focus-visible:ring-[#8b6f47]"
            aria-label="Close"
          >
            ✕
          </DialogClose>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle(props: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-bold text-[#2d2d2d]", props.className)}
      {...props}
    />
  )
}

function DialogDescription(props: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-[#777777]", props.className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
