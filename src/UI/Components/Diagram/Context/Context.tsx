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
 * CanvasContext is a React context that provides a way to pass data through the component tree without having to pass props down manually at every level.
 * It is used to share common information that can be considered "global" for a tree of React components.
 *
 * The context includes the following values:
 * @prop {DiagramHandlers | null} diagramHandlers: Handlers for the diagram.
 * @prop {(value: DiagramHandlers): void} setDiagramHandlers: Function to set the diagram handlers.
 * @prop {DictDialogData | null} dictToDisplay: Dictionary to display.
 * @prop {(value: DictDialogData | null): void} setDictToDisplay: Function to set the dictionary to display.
 * @prop {InstanceAttributeModel} formState: The state of the form.
 * @prop {(value: InstanceAttributeModel): void} setFormState: Function to set the state of the form.
 * @prop { Field[]} fields: The form fields.
 * @prop {(value: Field[]): void} setFields: Function to set the form fields.
 * @prop {dia.CellView | null} cellToEdit: The cell to edit.
 * @prop {(value: dia.CellView | null): void} setCellToEdit: Function to set the cell to edit.
 * @prop {Set<string>} looseEmbedded: The set of loose embedded entities on canvas.
 * @prop {(value: Set<string>): void} setLooseEmbedded: Function to set the loose embedded entities.
 * @prop {Map<string, ComposerServiceOrderItem>} instancesToSend: The instances to send to the backend.
 * @prop {React.Dispatch<React.SetStateAction<Map<string, ComposerServiceOrderItem>>>} setInstancesToSend: Function to set the instances to send.
 * @prop {StencilState | null} stencilState: The state of the stencil.
 * @prop {React.Dispatch<React.SetStateAction<StencilState | null>>} setStencilState: Function to set the state of the stencil.
 * @prop {boolean} isDirty: A flag indicating whether the canvas is dirty, which mean that service instance was modified.
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
