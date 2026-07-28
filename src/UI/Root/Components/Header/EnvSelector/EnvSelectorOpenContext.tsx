import { createContext } from "react";

interface EnvSelectorOpenContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * Shares the header's environment-selector open/closed state outside the header, so other parts
 * of the app (e.g. the Dashboard V2 Orchestrator card's "Switch" link) can open the same menu
 * instead of building a separate one.
 */
export const EnvSelectorOpenContext = createContext<EnvSelectorOpenContextType>({
  isOpen: false,
  setIsOpen: () => {},
});
