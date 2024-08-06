import { createContext } from "react";
import { dia } from "@inmanta/rappid";
import { UseQueryResult } from "@tanstack/react-query";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { Inventories } from "@/Data/Managers/V2/GetRelatedInventories";
import { ComposerServiceOrderItem, DictDialogData } from "../interfaces";

/**
 * The InstanceComposerProviderInterface
 * Reflects the InstanceDetailsContext.
 */
interface InstanceComposerProviderInterface {
  instance: InstanceWithRelations | null;
  serviceModels: ServiceModel[];
  mainService: ServiceModel;
  relatedInventories: UseQueryResult<Inventories, Error>;
}

/**
 * InstanceComposerContext
 * Should be used to provide context to the InstanceDetails page.
 * The logsQuery contains both the events and history data.
 */
export const InstanceComposerContext =
  createContext<InstanceComposerProviderInterface>({
    instance: null,
    serviceModels: [],
    mainService: {} as ServiceModel,
    relatedInventories: {} as UseQueryResult<Inventories, Error>,
  });

/**
 * The CanvasProviderInterface
 * Reflects the CanvasContext.
 */
interface CanvasProviderInterface {
  dictToDisplay: DictDialogData | null;
  setDictToDisplay: (value: DictDialogData | null) => void;

  formState: InstanceAttributeModel;
  setFormState: (value: InstanceAttributeModel) => void;

  fields: Field[];
  setFields: (value: Field[]) => void;

  cellToEdit: dia.CellView | null;
  setCellToEdit: (value: dia.CellView | null) => void;

  looseEmbedded: Set<string>;
  setLooseEmbedded: (value: Set<string>) => void;

  instancesToSend: Map<string, ComposerServiceOrderItem>;
  setInstancesToSend: (value: Map<string, ComposerServiceOrderItem>) => void;

  isDirty: boolean;
}

/**
 * CanvasContext
 * Should be used to provide context to the Canvas and it's children.
 */
export const CanvasContext = createContext<CanvasProviderInterface>({
  dictToDisplay: null,
  setDictToDisplay: (_value) => {},
  formState: {},
  setFormState: (_value) => {},
  fields: [],
  setFields: (_value) => {},
  cellToEdit: null,
  setCellToEdit: (_value) => {},
  looseEmbedded: new Set(),
  setLooseEmbedded: (_value) => {},
  instancesToSend: new Map(),
  setInstancesToSend: (_value) => {},
  isDirty: false,
});
