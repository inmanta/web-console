import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, ServiceModel } from "@/Core";
import {
  ConnectionRules,
  EmbeddedRule,
  InterServiceRule,
  TypeEnum,
} from "@/UI/Components/Diagram/interfaces";

import { ServiceEntityBlock } from "../shapes";

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
 * @param {dia.CellView | dia.ElementView | undefined} targetView - target of the connection
 * @param {dia.CellView | dia.ElementView} sourceView - source of the connection
 * @param {ConnectionRules} rules - rules for connections
 * @returns {boolean} - whether connection is allowed
 */
export const checkIfConnectionIsAllowed = (
  graph: dia.Graph,
  targetView: dia.CellView | dia.ElementView | undefined,
  sourceView: dia.CellView | dia.ElementView,
  rules: ConnectionRules,
): boolean => {
  if (!targetView) {
    return false;
  }

  let areSourceConnectionsExhausted = false;
  let areTargetConnectionExhausted = false;
  let doesSourceIsEmbeddedWithExhaustedConnections = false;
  let doesTargetIsEmbeddedWithExhaustedConnections = false;
  const targetName = (targetView.model as ServiceEntityBlock).getName();
  const sourceName = (sourceView.model as ServiceEntityBlock).getName();

  const targetRule = rules[targetName].find(
    (object) => object.name === sourceName,
  );

  const sourceRule = rules[sourceName].find(
    (object) => object.name === targetName,
  );

  //to receive neighbors we need to convert celView to Element
  const allElements = graph.getElements();
  const sourceAsElement = allElements.find(
    (element) => element.cid === sourceView.model.cid,
  );
  const targetAsElement = allElements.find(
    (element) => element.cid === targetView.model.cid,
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

    const isSourceBlockedFromEditing: boolean | undefined = sourceAsElement.get(
      "isBlockedFromEditing",
    );

    if (isSourceBlockedFromEditing) {
      const targetHolder = targetAsElement.get("holderName");
      const isTargetEmbedded = targetAsElement.get("isEmbeddedEntity");

      if (isTargetEmbedded && targetHolder === sourceName) {
        return false; // if source is blocked from editing then we can't connect embedded entities to it
      }
    }

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
  //the info about the connection between elements can be one directional
  const connectionIsInterServiceRelation =
    (sourceRule && sourceRule.kind === TypeEnum.INTERSERVICE) ||
    (targetRule && targetRule.kind === TypeEnum.INTERSERVICE);

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
  if (!rule) {
    return false;
  }

  const targetConnectionsForGivenRule = connectedElements.filter(
    (element) => element.getName() === rule.name,
  );

  //if is in edit mode and its modifier is r/rw then the connections are basically exhausted
  if (editMode && rule && rule.modifier !== "rw+") {
    return true;
  }

  //undefined and null are equal to no limit
  if (rule.upperLimit !== undefined && rule.upperLimit !== null) {
    return targetConnectionsForGivenRule.length >= rule.upperLimit;
  } else {
    return false;
  }
};

/**
 *  Function that checks if source is embedded, and if it is then if it is connected to the its owner/holder, and
 *  also if the the entity that we would like to connect is also the same type as the owner/holder.
 *
 *  Second boolean is to make it possible to connect nested embedded/inter-service related entities.
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
  const isSourceEmbedded = source.get("isEmbeddedEntity");
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
