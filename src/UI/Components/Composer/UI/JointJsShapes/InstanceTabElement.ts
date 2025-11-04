import { EmbeddedEntity, ServiceModel } from "@/Core";
import { dia, shapes, ui } from "@inmanta/rappid";
import { createFormState, CreateModifierHandler, FieldCreator } from "../../../ServiceInstanceForm";
import { ServiceEntityOptions, ServiceEntityShape } from "./ServiceEntityShape";
import { t_global_background_color_primary_default } from "@patternfly/react-tokens";
import { createSidebarItem } from "./sidebarItem";
import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";

export class InstanceTabElement {
    stencil: ui.Stencil;
    setCanvasState: Dispatch<SetStateAction<Map<string, ServiceEntityShape>>>;
    graph: dia.Graph;

    constructor(
        htmlRef: HTMLElement,
        scroller: ui.PaperScroller,
        service: ServiceModel,
        setCanvasState: Dispatch<SetStateAction<Map<string, ServiceEntityShape>>>,
        graph: dia.Graph
    ) {
        this.setCanvasState = setCanvasState;
        this.graph = graph;
        this.stencil = new ui.Stencil({
            id: "instance-tab-element",
            paper: scroller,
            width: 240,
            height: 400,
            scaleClones: true,
            dropAnimation: true,
            paperOptions: {
                sorting: dia.Paper.sorting.NONE,
                cellViewNamespace: shapes,
            },
            canDrag: (cellView) => {
                return !cellView.model.get("disabled");
            },
            dragStartClone: (cell: dia.Cell) => {
                return cell.clone();
            },
            dragEndClone: (cell: dia.Cell) => {
                const serviceModel = cell.get("serviceModel");

                const fieldCreator = new FieldCreator(new CreateModifierHandler());
                const fields = fieldCreator.attributesToFields(serviceModel.attributes);

                const shapeOptions: ServiceEntityOptions = {
                    entityType: "embedded",
                    readonly: false,
                    isNew: true,
                    lockedOnCanvas: false,
                    id: uuidv4(),
                    relationsDictionary: {},
                    serviceModel,
                    instanceAttributes: createFormState(fields),
                    rootEntities: {},
                    interServiceRelations: {},
                    embeddedEntities: {},
                };

                const newShape = new ServiceEntityShape(shapeOptions);

                return newShape;
            },
            layout: {
                columns: 1,
                rowHeight: "compact",
                horizontalAlign: "left",
                marginY: 10,
                // reset defaults
                resizeToFit: false,
                centre: false,
                dx: 0,
                dy: 0,
                background: t_global_background_color_primary_default.var,
            },
        });

        htmlRef.appendChild(this.stencil.el);
        this.stencil.render();
        const sidebarItems = transformEmbeddedToSidebarItems(service);

        this.stencil.load(sidebarItems);


        this.stencil.on("element:drop", (elementView) => {
            const model: ServiceEntityShape = elementView.model;
            const modelId = model.id;

            // Use functional form to always get the latest state
            this.setCanvasState((prevCanvasState) => {
                const newCanvasState = new Map(prevCanvasState);
                newCanvasState.set(modelId, model);
                return newCanvasState;
            });

            // Add the model to the canvas graph
            model.addTo(this.graph);
        });

    }
}

const transformEmbeddedToSidebarItems = (
    service: ServiceModel | EmbeddedEntity
): shapes.standard.Path[] => {
    return service.embedded_entities
        .filter((embedded_entity) => embedded_entity.modifier !== "r") // filter out read-only embedded entities from the stencil as they can't be created by the user
        .flatMap((embedded_entity, index) => {
            const sidebarItem = createSidebarItem({
                index,
                entityType: "embedded",
                serviceModel: embedded_entity,
                instanceAttributes: {},
                embeddedEntities: {},
                interServiceRelations: {},
                rootEntities: {},
                isDisabled: false,
                id: "",
                readonly: false,
                isNew: true,
            });
            const nestedSidebarItems = transformEmbeddedToSidebarItems(embedded_entity);

            return [sidebarItem, ...nestedSidebarItems];
        });
};

