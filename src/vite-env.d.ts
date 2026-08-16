/// <reference types="vite/client" />

declare module "*.css?url" {
  const content: string;
  export default content;
}

declare module "use-debounce" {
  export { useDebounce, useDebouncedCallback, useThrottledCallback } from "use-debounce/dist/index";
}

declare module "sonner" {
  export { toast, Toaster } from "sonner/dist/index";
}

declare module "@radix-ui/react-slot" {
  export const Slot: import("react").ForwardRefExoticComponent<
    import("react").HTMLAttributes<HTMLElement> & import("react").RefAttributes<HTMLElement>
  >;
  export type SlotProps = import("react").HTMLAttributes<HTMLElement>;
}

declare module "@radix-ui/react-alert-dialog";
