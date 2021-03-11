import { createContext, Dispatch } from "react";
import { AttributeModel } from "@/Core";

interface IInventoryContextData {
  attributes: AttributeModel[];
  environmentId: string | undefined;
  inventoryUrl: string;
  setErrorMessage: Dispatch<string>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  refresh: (data) => any;
}

export const InventoryContext = createContext({} as IInventoryContextData);
