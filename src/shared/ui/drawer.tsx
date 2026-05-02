"use client";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "@/shared/lib/css";

const Drawer = ({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root data-slot="drawer" {...props} />
);

const DrawerTrigger = ({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) => (
  <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
);

const DrawerPortal = ({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) => (
  <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
);

const DrawerClose = ({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) => (
  <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
);

const DrawerOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) => (
  <DrawerPrimitive.Backdrop
    data-slot="drawer-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "transition-opacity duration-300",
      "data-starting-style:opacity-0 data-ending-style:opacity-0",
      className,
    )}
    {...props}
  />
);

const DrawerContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Popup>) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex items-end">
      <DrawerPrimitive.Popup
        data-slot="drawer-content"
        className={cn(
          "bg-background flex flex-col outline-none",
          "w-full rounded-t-lg border-t",
          "transition-transform duration-300 ease-out",
          "data-starting-style:translate-y-full data-ending-style:translate-y-full",
          "mb-[-100vh] pb-[100vh]",
          className,
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 mb-2 h-1.5 w-[100px] shrink-0 rounded-full" />
        <DrawerPrimitive.Content className="relative flex h-full flex-col overflow-y-auto">
          {children}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Popup>
    </DrawerPrimitive.Viewport>
  </DrawerPortal>
);

const DrawerHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="drawer-header"
    className={cn("flex flex-col gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);

const DrawerFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="drawer-footer"
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);

const DrawerTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) => (
  <DrawerPrimitive.Title
    data-slot="drawer-title"
    className={cn("text-foreground font-semibold leading-none", className)}
    {...props}
  />
);

const DrawerDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) => (
  <DrawerPrimitive.Description
    data-slot="drawer-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
