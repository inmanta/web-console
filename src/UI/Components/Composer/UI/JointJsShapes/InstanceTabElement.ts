import { EmbeddedEntity, ServiceModel } from "@/Core";
import { dia, shapes, ui } from "@inmanta/rappid";
import { createFormState, CreateModifierHandler, FieldCreator } from "../../../ServiceInstanceForm";
import { ServiceEntityOptions, ServiceEntityShape } from "../ServiceEntityShape";
import { t_global_background_color_primary_default } from "@patternfly/react-tokens";
import { createSidebarItem } from "./sidebarItem";

export class InstanceTabElement {
    stencil: ui.Stencil;

    constructor(
        htmlRef: HTMLElement,
        scroller: ui.PaperScroller,
        service: ServiceModel
    ) {
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
                console.log("dragStartClone - cell:", cell);
                return cell.clone();
            },
            dragEndClone: (cell: dia.Cell) => {
                console.log("dragEndClone - cell:", cell);
                const serviceModel = cell.get("serviceModel");

                const fieldCreator = new FieldCreator(new CreateModifierHandler());
                const fields = fieldCreator.attributesToFields(serviceModel.attributes);

                const shapeOptions: ServiceEntityOptions = {
                    entityType: "embedded",
                    readonly: false,
                    isNew: true,
                    lockedOnCanvas: false,
                    id: "",
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
        console.log("Loading sidebar items:", sidebarItems);
        console.log("First item type:", sidebarItems[0]?.get('type'));
        console.log("First item attributes:", sidebarItems[0]?.attributes);
        this.stencil.load(sidebarItems);


        this.stencil.on("element:drop", (elementView) => {
            console.log(elementView);
        });

    }
}

const transformEmbeddedToSidebarItems = (
    service: ServiceModel | EmbeddedEntity
): shapes.standard.Path[] => {
    return service.embedded_entities
        .filter((embedded_entity) => embedded_entity.modifier !== "r") // filter out read-only embedded entities from the stencil as they can't be created by the user
        .flatMap((embedded_entity, index) => {
            console.log("embedded_entity", embedded_entity, index);
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

