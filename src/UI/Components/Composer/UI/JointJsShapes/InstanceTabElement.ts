import { Dispatch, SetStateAction } from "react";
import { dia, shapes, ui, mvc } from "@joint/plus";
import { t_global_background_color_primary_default } from "@patternfly/react-tokens";
import { v4 as uuidv4 } from "uuid";
import { EmbeddedEntity, ServiceModel } from "@/Core";
import { createFormState, CreateModifierHandler, FieldCreator } from "../../../ServiceInstanceForm";
import { RelationsDictionary } from "../../Data";
import {
  applyRequiredConnections,
  createEmbeddedEntityShapes,
  createLinksFromCanvasState,
  PositionTracker,
  getEmbeddedEntityKey,
  getShapeDimensions,
} from "../../Data/Helpers";
import { HORIZONTAL_SPACING } from "../../config";
import { ServiceEntityOptions, ServiceEntityShape } from "./ServiceEntityShape";
import { updateAllMissingConnectionsHighlights } from "./createHalo";
import { createSidebarItem } from "./sidebarItem";

export class InstanceTabElement {
  stencil: ui.Stencil;
  setCanvasState: Dispatch<SetStateAction<Map<string, ServiceEntityShape>>>;
  graph: dia.Graph;

  constructor(
    htmlRef: HTMLElement,
    scroller: ui.PaperScroller,
    service: ServiceModel,
    serviceModels: ServiceModel[],
    setCanvasState: Dispatch<SetStateAction<Map<string, ServiceEntityShape>>>,
    graph: dia.Graph,
    relationsDictionary: RelationsDictionary
  ) {
    this.setCanvasState = setCanvasState;
    this.graph = graph;
    const groups = buildGroups(serviceModels);

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
      groups: groups as unknown as { [key: string]: ui.Stencil.Group },
      canDrag: (cellView) => {
        return !cellView.model.get("disabled");
      },
      dragStartClone: (cell: dia.Cell) => {
        return cell.clone();
      },
      dragEndClone: (cell: dia.Cell) => {
        const serviceModel = cell.get("serviceModel");
        const entityType = cell.get("entityType") || "embedded";

        const fieldCreator = new FieldCreator(new CreateModifierHandler());
        const fields = fieldCreator.attributesToFields(serviceModel.attributes);

        const shapeOptions: ServiceEntityOptions = {
          entityType: entityType,
          readonly: false,
          isNew: true,
          lockedOnCanvas: false,
          id: uuidv4(),
          relationsDictionary,
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
        marginY: 10,
        horizontalAlign: "left",
        // reset defaults
        resizeToFit: false,
        centre: false,
        dx: 0,
        dy: 10,
        background: t_global_background_color_primary_default.var,
      },
    });

    htmlRef.appendChild(this.stencil.el);
    this.stencil.render();

    const groupKeys = Object.keys(groups);

    if (groupKeys.length > 0) {
      this.stencil.load(groups);
    }

    this.stencil.on("element:drop", (elementView) => {
      const model: ServiceEntityShape = elementView.model;
      const modelId = model.id;
      const serviceModel = model.serviceModel as ServiceModel;

      model.set("id", modelId);
      model.addTo(this.graph);
      const actualId = String(model.id);
      model.updateColumnsDisplay();

      // Build placeholder attribute data for required embedded entities
      const placeholderAttrs: Record<string, unknown> = {};
      applyRequiredConnections(
        serviceModel.inter_service_relations ?? [],
        serviceModel.embedded_entities ?? [],
        placeholderAttrs,
        [],
        serviceModels,
        new Set([serviceModel.name]),
      );

      // Track shapes created for embedded entities
      const localCanvasState = new Map<string, ServiceEntityShape>();
      const embeddedEntityCache = new Map<string, string>();
      const positionTracker = new PositionTracker();

      const dropPosition = model.position();
      const { width: bboxWidth, height: bboxHeight } = getShapeDimensions(model);
      positionTracker.reserve(actualId, dropPosition.x, dropPosition.y, bboxWidth, bboxHeight);

      serviceModel.embedded_entities?.forEach((embeddedEntity) => {
        if (embeddedEntity.modifier === "r") return;
        const embeddedData = placeholderAttrs[embeddedEntity.name];
        if (!embeddedData) return;

        const parentPosition = model.position();
        const embeddedIds = createEmbeddedEntityShapes(
          embeddedEntity,
          embeddedData,
          model,
          actualId,
          relationsDictionary,
          this.graph,
          localCanvasState,
          embeddedEntityCache,
          positionTracker,
          parentPosition.x + HORIZONTAL_SPACING,
          parentPosition.y,
        );

        if (embeddedIds.length > 0) {
          const entityKey = getEmbeddedEntityKey(embeddedEntity);
          model.connections.set(entityKey, embeddedIds);
        }
      });

      localCanvasState.set(actualId, model);
      createLinksFromCanvasState(localCanvasState, this.graph);

      const paper = elementView.paper;
      requestAnimationFrame(() => {
        this.setCanvasState((prevCanvasState) => {
          const newCanvasState = new Map(prevCanvasState);
          localCanvasState.forEach((shape, id) => {
            newCanvasState.set(id, shape);
          });

          if (paper) {
            requestAnimationFrame(() => {
              updateAllMissingConnectionsHighlights(paper);
            });
          }

          return newCanvasState;
        });
      });
    });
  }
}

/**
 * Type for stencil groups that matches what stencil.load() accepts.
 * JointJS runtime accepts arrays of cells, even though the constructor types expect Group objects.
 */
type StencilGroups = { [groupName: string]: Array<dia.Cell | mvc.ObjectHash> };

/**
 * Builds groups for the stencil, returning a type that matches what stencil.load() accepts.
 * Each group represents a serviceModel from the catalog, containing:
 * - The core service itself
 * - All embedded_entities available for that service
 */
const buildGroups = (serviceModels: ServiceModel[]): StencilGroups => {
  const groups: StencilGroups = {};

  serviceModels.forEach((serviceModel) => {
    const groupItems: shapes.standard.Path[] = [];

    // Add the core service itself as the first item in the group
    const coreServiceItem = createSidebarItem({
      index: 0,
      entityType: "core",
      serviceModel: serviceModel,
      instanceAttributes: {},
      embeddedEntities: {},
      interServiceRelations: {},
      rootEntities: {},
      isDisabled: false,
      id: "",
      readonly: false,
      isNew: true,
    });
    groupItems.push(coreServiceItem);

    // Add all embedded_entities from this service
    const embeddedItems = transformEmbeddedToSidebarItems(serviceModel);
    embeddedItems.forEach((item, index) => {
      // Update the index to account for the core service item
      item.set("index", index + 1);
    });
    groupItems.push(...embeddedItems);

    // Only create a group if it has items
    if (groupItems.length > 0) {
      groups[serviceModel.name] = groupItems;
    }
  });

  return groups;
};

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
