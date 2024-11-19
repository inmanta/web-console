import { createContext } from "react";
import { dia } from "@inmanta/rappid";
import { UseQueryResult } from "@tanstack/react-query";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GETTERS/GetInstanceWithRelations";
import { Inventories } from "@/Data/Managers/V2/GETTERS/GetInventoryList";
import { DiagramHandlers } from "../init";
import {
  ComposerServiceOrderItem,
  DictDialogData,
  StencilState,
  RelationCounterForCell,
} from "../interfaces";

/**
 * The InstanceComposerCreatorProviderInterface
 * Reflects the InstanceComposerContext.
 */
interface InstanceComposerCreatorProviderInterface {
  instance: InstanceWithRelations | null;
  serviceModels: ServiceModel[];
  mainService: ServiceModel;
  relatedInventoriesQuery: UseQueryResult<Inventories, Error>;
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
    relatedInventoriesQuery: {} as UseQueryResult<Inventories, Error>,
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

  looseElement: Set<string>;
  setLooseElement: (value: Set<string>) => void;

  serviceOrderItems: Map<string, ComposerServiceOrderItem>;
  setServiceOrderItems: React.Dispatch<
    React.SetStateAction<Map<string, ComposerServiceOrderItem>>
  >;

  interServiceRelationsOnCanvas: Map<string, RelationCounterForCell>;
  setInterServiceRelationsOnCanvas: React.Dispatch<
    React.SetStateAction<Map<string, RelationCounterForCell>>
  >;

  stencilState: StencilState | null;
  setStencilState: React.Dispatch<React.SetStateAction<StencilState | null>>;

  isDirty: boolean;
}

/**
 * The default values for the CanvasContext. Look for the in detail description of the values in the CanvasContext docstrings.
 */
export const defaultCanvasContext: CanvasProviderInterface = {
  diagramHandlers: null,
  setDiagramHandlers: () => {},
  dictToDisplay: null,
  setDictToDisplay: () => {},
  formState: {},
  setFormState: () => {},
  fields: [],
  setFields: () => {},
  cellToEdit: null,
  setCellToEdit: () => {},
  looseElement: new Set(),
  setLooseElement: () => {},
  serviceOrderItems: new Map(),
  setServiceOrderItems: () => {},
  interServiceRelationsOnCanvas: new Map(),
  setInterServiceRelationsOnCanvas: () => {},
  stencilState: {},
  setStencilState: () => {},
  isDirty: false,
};

/**
 * CanvasContext is a React context that provides a way to share the state of the Composer between all its children components.
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
 * @prop {Set<string>} looseElement: The set of loose embedded entities on canvas.
 * @prop {(value: Set<string>): void} setLooseElement: Function to set the loose embedded entities.
 * @prop {Map<string, ComposerServiceOrderItem>} serviceOrderItems: The instances to send to the backend.
 * @prop {React.Dispatch<React.SetStateAction<Map<string, ComposerServiceOrderItem>>>} setServiceOrderItems: Function to set the instances to send.
 * @prop {StencilState | null} stencilState: The state of the stencil it holds information about amount of embedded entities of each type on the canvas, and limitation and minimal requirements of those in the instance.
 * @prop {React.Dispatch<React.SetStateAction<StencilState | null>>} setStencilState: Function to set the state of the stencil.
 * @prop {boolean} isDirty: A flag indicating whether the canvas is dirty, which mean that service instance was modified.
 */
export const CanvasContext =
  createContext<CanvasProviderInterface>(defaultCanvasContext);
