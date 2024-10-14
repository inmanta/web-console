import { dia, g, highlighters } from "@inmanta/rappid";
import { isEqual } from "lodash";
import { v4 as uuidv4 } from "uuid";
import {
  EmbeddedEntity,
  InstanceAttributeModel,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
import {
  ComposerServiceOrderItem,
  ConnectionRules,
  EmbeddedRule,
  InterServiceRule,
  TypeEnum,
  LabelLinkView,
  SavedCoordinates,
  EmbeddedEventEnum,
  StencilState,
  ActionEnum,
} from "@/UI/Components/Diagram/interfaces";

import { ServiceEntityBlock } from "./shapes";

/**
 * Extracts the IDs of the relations of a service instance.
 *
 * @param service - The service model.
 * @param instance - The service instance.
 * @returns {string[]} An array of relation IDs.
 */
export const extractRelationsIds = (
  service: ServiceModel,
  instance: ServiceInstanceModel,
): string[] => {
  const relationKeys = service.inter_service_relations?.map(
    (relation) => relation.name,
  );

  if (!relationKeys) {
    return [];
  }

  const extractRelation = (attributes: InstanceAttributeModel): string[] =>
    relationKeys
      .map((key) => String(attributes[key]))
      .filter((attribute) => attribute !== "undefined");

  if (instance.candidate_attributes !== null) {
    return extractRelation(instance.candidate_attributes);
  } else if (instance.active_attributes !== null) {
    return extractRelation(instance.active_attributes);
  } else {
    return [];
  }
};

/**
 * Create object that holds all of the possible interservice relation connections
 * @param {(ServiceModel | EmbeddedEntity)[]} services
 * @param rules
 * @returns
 */
export const createConnectionRules = (
  services: (ServiceModel | EmbeddedEntity)[],
  rules: {
    [serviceName: string]: (EmbeddedRule | InterServiceRule)[];
  },
): ConnectionRules => {
  services.map((service) => {
    if (rules[service.name] === undefined) {
      rules[service.name] = [];
    }
    const tempRules: (EmbeddedRule | InterServiceRule)[] = [];

    service.embedded_entities.map((entity) => {
      tempRules.push({
        kind: TypeEnum.EMBEDDED,
        name: entity.name,
        lowerLimit: entity.lower_limit || null,
        upperLimit: entity.upper_limit || null,
        modifier: entity.modifier,
      });

      //embedded entities in contrary to inter-service relations has possible nested connection thus why we calling function recurrently
      createConnectionRules([entity], rules);
    });

    if (service.inter_service_relations) {
      service.inter_service_relations.map((relation) => {
        tempRules.push({
          kind: TypeEnum.INTERSERVICE,
          name: relation.entity_type,
          attributeName: relation.name,
          lowerLimit: relation.lower_limit || null,
          upperLimit: relation.upper_limit || null,
          modifier: relation.modifier,
        });
      });
    }

    if (tempRules.length > 0) {
      rules[service.name] = rules[service.name].concat(tempRules);
    }
  });

  return rules;
};

/**
 * Function that takes source of the connection and eventual target, and check if the rules allows connection between entities, and
 * whether source & target didn't exhaust eventual limits for given type of connection
 *
 * @param {dia.Graph} graph - jointjs graph
 * @param {dia.CellView | dia.ElementView | undefined} tgtView - target of the connection
 * @param {dia.CellView | dia.ElementView} srcView - source of the connection
 * @param {ConnectionRules} rules - rules for connections
 * @returns {boolean} - whether connection is allowed
 */
export const checkIfConnectionIsAllowed = (
  graph: dia.Graph,
  tgtView: dia.CellView | dia.ElementView | undefined,
  srcView: dia.CellView | dia.ElementView,
  rules: ConnectionRules,
): boolean => {
  let areSourceConnectionsExhausted = false;
  let areTargetConnectionExhausted = false;
  let doesSourceIsEmbeddedWithExhaustedConnections = false;
  let doesTargetIsEmbeddedWithExhaustedConnections = false;
  const targetName = (tgtView?.model as ServiceEntityBlock).getName();
  const sourceName = (srcView.model as ServiceEntityBlock).getName();

  const targetRule = rules[targetName].find(
    (object) => object.name === sourceName,
  );

  const sourceRule = rules[sourceName].find(
    (object) => object.name === targetName,
  );

  //to receive neighbors we need to convert celView to Element
  const allElements = graph.getElements();
  const sourceAsElement = allElements.find(
    (element) => element.cid === srcView.model.cid,
  );
  const targetAsElement = allElements.find(
    (element) => element.cid === tgtView?.model.cid,
  );

  if (sourceAsElement && targetAsElement) {
    const connectedElementsToSource = graph.getNeighbors(
      sourceAsElement,
    ) as ServiceEntityBlock[];
    const connectedElementsToTarget = graph.getNeighbors(
      targetAsElement,
    ) as ServiceEntityBlock[];

    const isTargetInEditMode: boolean | undefined =
      targetAsElement.get("isInEditMode");
    const isSourceInEditMode: boolean | undefined =
      sourceAsElement.get("isInEditMode");

    areTargetConnectionExhausted = checkWhetherConnectionRulesAreExhausted(
      connectedElementsToTarget,
      targetRule,
      !!isTargetInEditMode,
    );
    areSourceConnectionsExhausted = checkWhetherConnectionRulesAreExhausted(
      connectedElementsToSource,
      sourceRule,
      !!isSourceInEditMode,
    );

    doesTargetIsEmbeddedWithExhaustedConnections =
      doesElementIsEmbeddedWithExhaustedConnections(
        targetAsElement,
        connectedElementsToTarget,
        sourceAsElement,
      );

    doesSourceIsEmbeddedWithExhaustedConnections =
      doesElementIsEmbeddedWithExhaustedConnections(
        sourceAsElement,
        connectedElementsToSource,
        targetAsElement,
      );
  }

  const elementsCanBeConnected =
    sourceRule !== undefined || targetRule !== undefined;

  const connectionIsInterServiceRelation =
    sourceRule?.kind === TypeEnum.INTERSERVICE ||
    targetRule?.kind === TypeEnum.INTERSERVICE;

  if (elementsCanBeConnected) {
    //if elements have interservice relation then we need to check if they are exhausted
    if (connectionIsInterServiceRelation) {
      return !areSourceConnectionsExhausted && !areTargetConnectionExhausted;
    } else {
      return !(
        doesTargetIsEmbeddedWithExhaustedConnections ||
        doesSourceIsEmbeddedWithExhaustedConnections
      );
    }
  }

  return elementsCanBeConnected;
};

/**
 * Iterate through connectedElements of some shape to check if there are possible connections left for given shape
 *
 * @param {ServiceEntityBlock[]} connectedElements list of connected elements to given shape
 * @param {EmbeddedRule | InterServiceRule | undefined} rule telling which shapes can connect to each other and about their limitations
 * @param {boolean} editMode which defines whether connectionts rule is assesed for instance edited or newly created
 * @returns {boolean} - whether connection are exhausted
 */
export const checkWhetherConnectionRulesAreExhausted = (
  connectedElements: ServiceEntityBlock[],
  rule: EmbeddedRule | InterServiceRule | undefined,
  editMode: boolean,
): boolean => {
  const targetConnectionsForGivenRule = connectedElements.filter(
    (element) => element.getName() === rule?.name,
  );

  //if is in edit mode and its modifier is r/rw then the connections are basically exhausted
  if (editMode && rule && rule.modifier !== "rw+") {
    return true;
  }
  //undefined and null are equal to no limit
  if (rule?.upperLimit !== undefined && rule?.upperLimit !== null) {
    return targetConnectionsForGivenRule.length >= rule?.upperLimit;
  } else {
    return false;
  }
};

/**
 *  Function that checks if source is embedded, and if it is then if it is connected to the its owner/holder, and
 *  also if the the entity that we would like to connect is also the same type as the owner/holder.
 *
 *  Second boolean is to make it possible to connect nested embedded/related entities.
 *
 * @param {dia.Element} source element that originate our connection
 * @param {ServiceEntityBlock[]} connectedElementsToSource array of elements that are connected to the given entity
 * @param {dia.Element} target element that is destination for the connection
 * @returns {boolean} - whether element is embedded and its available connections are exhausted
 */
const doesElementIsEmbeddedWithExhaustedConnections = (
  source: dia.Element,
  connectedElementsToSource: ServiceEntityBlock[],
  target: dia.Element,
): boolean => {
  const isSourceEmbedded = source.get("isEmbedded");
  const sourceHolderName = source.get("holderName");
  const isTargetBlocked = target.get("isBlockedFromEditing");

  //if source Embbedded and target is blocked then return true as we can't add anything to it in composer
  if (isSourceEmbedded && isTargetBlocked) {
    return true;
  }
  const targetName = target.get("entityName");

  if (isSourceEmbedded && sourceHolderName !== undefined) {
    //if source is embedded entity then check if it is already connected according to it's parent rules

    const connectedHolder = connectedElementsToSource.filter((element) => {
      //if connected shape Name to the target has the same name is the same as the sou
      return element.getName() === sourceHolderName;
    });

    const doesSourceMatchholderName = targetName === sourceHolderName;

    return connectedHolder.length > 0 && doesSourceMatchholderName;
  }

  return false;
};

/**
 * Function that will merge state from Instance Composer to proper object for order_api endpoint.
 * Instance composer state is being split into multiple objects that could be embedded into other available, so we need to recursively
 * go through all of them to group, and sort them
 * @param {ComposerServiceOrderItem} parentInstance Instance that is the main object and to which other instance are eventually connected
 * @param {ComposerServiceOrderItem[]} instances all of the instances that were created/edited in the instance, not including parentInstance
 * @param {ServiceModel | EmbeddedEntity} serviceModel - ServiceModel or EmbeddedEntity that is the model for the current iteration to build upon
 * @param {boolean=} isEmbedded boolean informing whether instance passed is embedded or not
 * @returns {ComposerServiceOrderItem} - object that could be sent to the backend or embedded into other object that could be sent
 */
export const shapesDataTransform = (
  parentInstance: ComposerServiceOrderItem,
  instances: ComposerServiceOrderItem[],
  serviceModel: ServiceModel | EmbeddedEntity,
  isEmbedded = false,
): ComposerServiceOrderItem => {
  let areEmbeddedEdited = false;
  const matchingInstances = instances.filter(
    (checkedInstance) =>
      checkedInstance.embeddedTo === parentInstance.instance_id,
  );

  const notMatchingInstances = instances.filter(
    (checkedInstance) =>
      checkedInstance.embeddedTo !== parentInstance.instance_id,
  );

  //iterate through matching (embedded)instances and group them according to property type to be able to put them in the Array if needed at once
  const groupedEmbedded: { [instanceId: string]: ComposerServiceOrderItem[] } =
    matchingInstances.reduce((reducer, instance) => {
      reducer[instance.service_entity] = reducer[instance.service_entity] || [];
      reducer[instance.service_entity].push(instance);

      return reducer;
    }, Object.create({}));

  for (const [key, instancesToEmbed] of Object.entries(groupedEmbedded)) {
    if (parentInstance.attributes) {
      const updated: InstanceAttributeModel[] = [];
      const embeddedModel = serviceModel.embedded_entities.find(
        (entity) => entity.name === instancesToEmbed[0].service_entity,
      );

      //iterate through instancesToEmbed to recursively join potential nested embedded entities into correct objects in correct state
      instancesToEmbed.forEach((instanceToEmbed) => {
        if (embeddedModel) {
          const updatedInstance = shapesDataTransform(
            instanceToEmbed,
            notMatchingInstances,
            embeddedModel,
            !!embeddedModel,
          );

          if (!areEmbeddedEdited) {
            areEmbeddedEdited =
              !parentInstance.action && updatedInstance.action !== null;
          }
          if (
            updatedInstance.action !== "delete" &&
            updatedInstance.attributes
          ) {
            updated.push(updatedInstance.attributes);
          }
        }
      });

      parentInstance.attributes[key] =
        updated.length === 1 && isSingularRelation(embeddedModel)
          ? updated[0]
          : updated;
    }
  }

  //convert relatedTo property into valid attribute
  if (parentInstance.relatedTo) {
    Array.from(parentInstance.relatedTo).forEach(([id, attributeName]) => {
      if (parentInstance.attributes) {
        const model = serviceModel.inter_service_relations?.find(
          (relation) => relation.name === attributeName,
        );

        if (model) {
          if (model.upper_limit !== 1) {
            if (Array.isArray(parentInstance.attributes[attributeName])) {
              (parentInstance.attributes[attributeName] as dia.Cell.ID[]).push(
                id,
              );
            } else {
              parentInstance.attributes[attributeName] = [id];
            }
          } else {
            parentInstance.attributes[attributeName] = id;
          }
        }
      }
    });
  }

  //if any of its embedded instances were edited, and its action is indicating no changes to main attributes, change it to "update"
  if (areEmbeddedEdited) {
    parentInstance.action = "update";
  }

  //if its action is "update" and instance isn't embedded change value property to edit as that's what api expect in the body
  if (parentInstance.action === "update" && !isEmbedded) {
    if (!!parentInstance.attributes && !parentInstance.edits) {
      parentInstance.edits = [
        {
          edit_id: `${parentInstance.instance_id}_order_update-${uuidv4()}`,
          operation: "replace",
          target: ".",
          value: parentInstance.attributes,
        },
      ];
    }
    delete parentInstance.attributes;
  }

  delete parentInstance.embeddedTo;
  delete parentInstance.relatedTo;

  return parentInstance;
};

/**
 * Function that takes Map of standalone instances that include core, embedded and related entities and
 * bundle in proper Instance Objects that could be accepted by the order_api request
 *
 * @param {Map<string, ComposerServiceOrderItem>}instances Map of Instances
 * @param {ServiceModel[]} services - Array of service models
 * @returns {ComposerServiceOrderItem[]}
 */
export const getServiceOrderItems = (
  instances: Map<string, ComposerServiceOrderItem>,
  services: ServiceModel[],
): ComposerServiceOrderItem[] => {
  const mapToArray = Array.from(instances, (instance) => instance[1]); //only value, the id is stored in the object anyway
  const deepCopiedMapToArray: ComposerServiceOrderItem[] = JSON.parse(
    JSON.stringify(mapToArray),
  ); //only value, the id is stored in the object anyway

  //we need also deep copy relatedTo Map separately
  deepCopiedMapToArray.forEach((instance, index) => {
    instance.relatedTo = mapToArray[index].relatedTo
      ? JSON.parse(
          JSON.stringify(
            Array.from(mapToArray[index].relatedTo as Map<string, string>),
          ),
        )
      : mapToArray[index].relatedTo;
  });
  const topServicesNames = services.map((service) => service.name);

  // topInstances are instances that have top-level attributes from given serviceModel, and theoretically are the ones accepting embedded-entities
  const topInstances = deepCopiedMapToArray.filter((instance) =>
    topServicesNames.includes(instance.service_entity),
  );
  const embeddedInstances = deepCopiedMapToArray.filter(
    (instance) => !topServicesNames.includes(instance.service_entity),
  );

  const mergedInstances: ComposerServiceOrderItem[] = [];

  topInstances.forEach((instance) => {
    const serviceModel = services.find(
      (service) => service.name === instance.service_entity,
    );

    if (serviceModel) {
      mergedInstances.push(
        shapesDataTransform(instance, embeddedInstances, serviceModel),
      );
    }
  });

  return mergedInstances;
};

const isSingularRelation = (model?: EmbeddedEntity) => {
  return !!model && !!model.upper_limit && model.upper_limit === 1;
};

/**
 * Find if the relations of some instance includes Id of the instance passed through prop
 * @param {Map<dia.Cell.ID, string>} neighborRelations map of ids that could include id of instanceAsTable
 * @param {ServiceEntityBlock} instanceAsTable Instance to which should instances connect to
 *
 * @returns {{ id: dia.Cell.ID, attributeName: string} | undefined}
 */
export const findCorrespondingId = (
  neighborRelations: Map<dia.Cell.ID, string>,
  instanceAsTable: ServiceEntityBlock,
):
  | {
      id: dia.Cell.ID;
      attributeName: string;
    }
  | undefined => {
  return Array.from(neighborRelations, ([id, attributeName]) => ({
    id,
    attributeName,
  })).find(({ id }) => id === instanceAsTable.id);
};

/**
 * Updates the position of a label relative to a link's target or source side.
 * @param {"target" | "source"} side - The side of the link where the label is positioned. Can be "target" or "source".
 * @param {g.Rect} _refBBox - The bounding box of a reference element (unused).
 * @param {SVGSVGElement} node - The SVG element representing the label.
 * @param {{ [key: string]: unknown }} _attrs - Additional attributes for the label (unused).
 * @param {LabelLinkView} linkView - The view representing the link associated with the label.
 * @returns {{ textAnchor: "start" | "end", x: number, y: number }} - An object containing the updated attributes for the label.
 */
export const updateLabelPosition = (
  side: "target" | "source",
  _refBBox: g.Rect,
  _node: SVGSVGElement,
  _attrs: { [key: string]: unknown },
  linkView: LabelLinkView, //dia.LinkView & dia.Link doesn't have sourceView or targetView properties in the model
): { textAnchor: "start" | "end"; x: number; y: number } => {
  let textAnchor, tx, ty, viewCoordinates, anchorCoordinates;

  if (side === "target") {
    viewCoordinates = linkView.targetView.model.position();
    anchorCoordinates = linkView.targetPoint;
  } else {
    viewCoordinates = linkView.sourceView.model.position();
    anchorCoordinates = linkView.sourcePoint;
  }
  if (viewCoordinates && anchorCoordinates) {
    if (viewCoordinates.x !== anchorCoordinates.x) {
      textAnchor = "start";
      tx = 15;
    } else {
      textAnchor = "end";
      tx = -15;
    }
  }
  const isTargetBelow =
    linkView.getEndAnchor("target").y < linkView.getEndAnchor("source").y;

  switch (side) {
    case "target":
      ty = isTargetBelow ? -15 : 15;
      break;
    case "source":
      ty = isTargetBelow ? 15 : -15;
      break;
  }

  return { textAnchor: textAnchor, x: tx || 0, y: ty || 0 };
};

/**
 * Toggle the highlighting of a loose element in a diagram cell view.
 * @param {dia.CellView} cellView - The cell view containing the element.
 * @param {EmbeddedEventEnum} kind - The action to perform, either "add" to add highlighting or "remove" to remove highlighting.
 *
 * @returns {void}
 */
export const toggleLooseElement = (
  cellView: dia.CellView,
  kind: EmbeddedEventEnum,
): void => {
  switch (kind) {
    case "add":
      highlighters.mask.add(cellView, "root", "loose_element", {
        padding: 0,
        className: "loose_element-highlight",
        attrs: {
          "stroke-width": 3,
          filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))",
        },
      });
      break;
    case "remove":
      const highlighter = dia.HighlighterView.get(cellView, "loose_element");

      if (highlighter) {
        highlighter.remove();
      }
      break;
    default:
      break;
  }
  document.dispatchEvent(
    new CustomEvent("looseEmbedded", {
      detail: JSON.stringify({
        kind,
        id: cellView.model.id,
      }),
    }),
  );
};

/**
 * Gets the coordinates of all cells in the graph. https://resources.jointjs.com/docs/jointjs/v4.0/joint.html#dia.Graph
 *
 * @param {dia.Graph} graph - The graph from which to get the cells.
 *
 * @returns {SavedCoordinates[]} An array of objects, each containing the id, name, attributes, and coordinates of a cell.
 */
export const getCellsCoordinates = (graph: dia.Graph): SavedCoordinates[] => {
  const cells = graph.getCells();

  return cells
    .filter((cell) => cell.attributes.type === "app.ServiceEntityBlock")
    .map((cell) => ({
      id: cell.id,
      name: cell.attributes.entityName,
      attributes: cell.attributes.instanceAttributes,
      coordinates: cell.attributes.position,
    }));
};

/**
 * Applies coordinates to cells in the graph. https://resources.jointjs.com/docs/jointjs/v4.0/joint.html#dia.Graph
 *
 * @param {dia.Graph} graph - The graph to which to apply the coordinates.
 * @param {SavedCoordinates[]} coordinates - The coordinates to apply to the cells.
 *
 * @returns {void}
 */
export const applyCoordinatesToCells = (
  graph: dia.Graph,
  coordinates: SavedCoordinates[],
): void => {
  const cells = graph.getCells();

  coordinates.forEach((element) => {
    const correspondingCell = cells.find(
      (cell) =>
        element.id === cell.id ||
        (element.name === cell.attributes.entityName &&
          isEqual(element.attributes, cell.attributes.instanceAttributes)),
    );

    if (correspondingCell) {
      correspondingCell.set("position", {
        x: element.coordinates.x,
        y: element.coordinates.y,
      });
    }
  });
};

/**
 * Finds the inter-service relations for the given service model or embedded entity.
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity to find inter-service relations for.
 * @returns {string[]} An array of entity types that have inter-service relations with the given service model or embedded entity
 */
export const findInterServiceRelations = (
  serviceModel: ServiceModel | EmbeddedEntity,
): string[] => {
  const result =
    serviceModel.inter_service_relations?.map(
      (relation) => relation.entity_type,
    ) || [];

  const embeddedEntitiesResult = serviceModel.embedded_entities.flatMap(
    (embedded_entity) => findInterServiceRelations(embedded_entity),
  );

  return result.concat(embeddedEntitiesResult);
};

/**
 * Creates a stencil state for a given service model or embedded entity.
 *
 * @param serviceModel - The service model or embedded entity to create a stencil state for.
 * @param isInEditMode - A boolean indicating whether the stencil is in edit mode. Defaults to false.
 * @returns {StencilState} The created stencil state.
 */
export const createStencilState = (
  serviceModel: ServiceModel | EmbeddedEntity,
  isInEditMode = false,
): StencilState => {
  let stencilState: StencilState = {};

  serviceModel.embedded_entities.forEach((entity) => {
    stencilState[entity.name] = {
      min: entity.lower_limit,
      max: entity.modifier === "rw" && isInEditMode ? 0 : entity.upper_limit,
      current: 0,
    };
    if (entity.embedded_entities) {
      stencilState = {
        ...stencilState,
        ...createStencilState(entity),
      };
    }
  });

  return stencilState;
};

/**
 * Updates the instances to send based on the action performed on a cell.
 *
 * @param cell - The cell that the action was performed on.
 * @param action - The action that was performed.
 * @param instancesToSend - The current map of instances to send.
 * @returns  {Map<string, ComposerServiceOrderItem>} The updated map of instances to send.
 */
export const updateInstancesToSend = (
  cell: ServiceEntityBlock,
  action: ActionEnum,
  instancesToSend: Map<string, ComposerServiceOrderItem>,
): Map<string, ComposerServiceOrderItem> => {
  const newInstance: ComposerServiceOrderItem = {
    instance_id: cell.id,
    service_entity: cell.getName(),
    config: {},
    action: null,
    attributes: cell.get("sanitizedAttrs"),
    edits: null,
    embeddedTo: cell.get("embeddedTo"),
    relatedTo: cell.getRelations(),
  };
  const copiedInstances = new Map(instancesToSend); // copy

  const updatedInstance = instancesToSend.get(String(cell.id));

  switch (action) {
    case "update":
      //action in the instance isn't the same as action passed to this function, this assertion is to make sure that the update action won't change the action state of newly created instance.
      newInstance.action =
        updatedInstance?.action === "create" ? "create" : "update";
      copiedInstances.set(String(cell.id), newInstance);
      break;
    case "create":
      newInstance.action = action;
      copiedInstances.set(String(cell.id), newInstance);
      break;
    default:
      if (
        updatedInstance &&
        (updatedInstance.action === null || updatedInstance.action === "update")
      ) {
        copiedInstances.set(String(cell.id), {
          instance_id: cell.id,
          service_entity: cell.getName(),
          config: {},
          action: "delete",
          attributes: null,
          edits: null,
          embeddedTo: cell.attributes.embeddedTo,
          relatedTo: cell.attributes.relatedTo,
        });
      } else {
        copiedInstances.delete(String(cell.id));
      }
      break;
  }

  return copiedInstances;
};
