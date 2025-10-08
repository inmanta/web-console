import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { createContext } from "react";
import { ServiceEntityShape } from "../UI";
import { Inventories, InstanceWithRelations } from "@/Data/Queries";
import { CanvasHandlers, RelationsDictionary } from ".";
import { dia, ui } from "@inmanta/rappid";


interface ComposerContextInterface {
    canvasHandlers: CanvasHandlers | null;
    setCanvasHandlers: (value: CanvasHandlers) => void;
    formState: InstanceAttributeModel;
    setFormState: (value: InstanceAttributeModel) => void;
    fields: Field[];
    setFields: (value: Field[]) => void;
    isDirty: boolean;
    setIsDirty: (value: boolean) => void;
    relationsDictionary: RelationsDictionary;
    setRelationsDictionary: (value: RelationsDictionary) => void;
    canvasState: Map<string, ServiceEntityShape>;
    setCanvasState: (value: Map<string, ServiceEntityShape>) => void;
    activeCell: ServiceEntityShape | null;
    setActiveCell: (value: ServiceEntityShape | null) => void;
    mainService: ServiceModel | null;
    serviceCatalog: ServiceModel[];
    serviceInventories: Inventories | null;
    serviceInstanceId: string | null;
    scroller: ui.PaperScroller | null;
    paper: dia.Paper | null;
    graph: dia.Graph | null;
}

export const composerContext: ComposerContextInterface = {
    canvasHandlers: null,
    setCanvasHandlers: () => {},
    formState: {},
    setFormState: () => {},
    fields: [],
    setFields: () => {},
    isDirty: false,
    setIsDirty: () => {},
    relationsDictionary: {},
    setRelationsDictionary: () => {},
    canvasState: new Map(),
    setCanvasState: () => {},
    activeCell: null,
    setActiveCell: () => {},
    mainService: null,
    serviceCatalog: [],
    serviceInventories: null,
    serviceInstanceId: null,
    scroller: null,
    paper: null,
    graph: null,
}

export const ComposerContext = createContext(composerContext)