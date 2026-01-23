import { createContext, Dispatch, SetStateAction } from "react";
import { dia, ui } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import { Inventories } from "@/Data/Queries";
import { ServiceEntityShape } from "../UI";
import { ComposerServiceOrderItem } from "./Helpers/deploymentHelpers";
import { CanvasHandlers, RelationsDictionary } from ".";

interface ComposerContextInterface {
  canvasHandlers: CanvasHandlers | null;
  relationsDictionary: RelationsDictionary;
  canvasState: Map<string, ServiceEntityShape>;
  setCanvasState: Dispatch<SetStateAction<Map<string, ServiceEntityShape>>>;
  activeCell: ServiceEntityShape | null;
  mainService: ServiceModel | null;
  serviceCatalog: ServiceModel[];
  serviceInventories: Inventories | null;
  serviceInstanceId: string | null;
  scroller: ui.PaperScroller | null;
  paper: dia.Paper | null;
  graph: dia.Graph | null;
  editable: boolean;
  serviceOrderItems: Map<string, ComposerServiceOrderItem>;
  hasValidationErrors: boolean;
}

export const composerContext: ComposerContextInterface = {
  canvasHandlers: null,
  relationsDictionary: {},
  canvasState: new Map(),
  setCanvasState: () => {},
  activeCell: null,
  mainService: null,
  serviceCatalog: [],
  serviceInventories: null,
  serviceInstanceId: null,
  scroller: null,
  paper: null,
  graph: null,
  editable: false,
  serviceOrderItems: new Map(),
  hasValidationErrors: false,
};

export const ComposerContext = createContext(composerContext);
