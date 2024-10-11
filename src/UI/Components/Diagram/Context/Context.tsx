import { createContext } from "react";
import { dia } from "@inmanta/rappid";
import { UseQueryResult } from "@tanstack/react-query";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GETTERS/GetInstanceWithRelations";
import { Inventories } from "@/Data/Managers/V2/GETTERS/GetRelatedInventories";
import { DiagramHandlers } from "../init";
import {
  ComposerServiceOrderItem,
  DictDialogData,
  StencilState,
} from "../interfaces";

/**
 * The InstanceComposerCreatorProviderInterface
 * Reflects the InstanceComposerContext.
 */
interface InstanceComposerCreatorProviderInterface {
  instance: InstanceWithRelations | null;
  serviceModels: ServiceModel[];
  mainService: ServiceModel;
  relatedInventories: UseQueryResult<Inventories, Error>;
}

/**
 * InstanceComposerContext
 * Should be used to provide context to the Composer Page.
 */
export const InstanceComposerContext =
  createContext<InstanceComposerCreatorProviderInterface>({
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
  diagramHandlers: DiagramHandlers | null;
  setDiagramHandlers: (value: DiagramHandlers) => void;

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
  setInstancesToSend: React.Dispatch<
    React.SetStateAction<Map<string, ComposerServiceOrderItem>>
  >;

  stencilState: StencilState | null;
  setStencilState: React.Dispatch<React.SetStateAction<StencilState | null>>;

  isDirty: boolean;
}

/**
 * CanvasContext
 * Should be used to provide context to the Canvas and it's children.
 */
export const CanvasContext = createContext<CanvasProviderInterface>({
  diagramHandlers: null,
  setDiagramHandlers: (_value) => {},
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
  stencilState: {},
  setStencilState: (_value) => {},
  isDirty: false,
});
