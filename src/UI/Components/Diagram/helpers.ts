import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, ServiceInstanceModel, ServiceModel } from "@/Core";
import { ConnectionRules, Rule } from "./interfaces";
import { ServiceEntityBlock } from "./shapes";

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
  if (instance.candidate_attributes !== null) {
    return relationKeys
      .map((key) =>
        instance.candidate_attributes !== null
          ? instance.candidate_attributes[key]
          : undefined,
      )
      .filter((value) => value !== undefined) as string[];
  } else if (instance.active_attributes !== null) {
    return relationKeys
      .map((key) =>
        instance.active_attributes !== null
          ? instance.active_attributes[key]
          : undefined,
      )
      .filter((value) => value !== undefined) as string[];
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
    [serviceName: string]: Rule[];
  },
): ConnectionRules => {
  services.map((service) => {
    if (rules[service.name] === undefined) {
      rules[service.name] = [];
    }
    const tempRules: Rule[] = [];

    service.embedded_entities.map((entity) => {
      tempRules.push({
        name: entity.name,
        lowerLimit: entity.lower_limit || null,
        upperLimit: entity.upper_limit || null,
      });

      createConnectionRules([entity], rules);
    });

    if (service.inter_service_relations) {
      service.inter_service_relations.map((relation) => {
        tempRules.push({
          name: relation.entity_type,
          lowerLimit: relation.lower_limit || null,
          upperLimit: relation.upper_limit || null,
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
 * @param {dia.Graph} graph
 * @param {dia.CellView | dia.ElementView | undefined} tgtView
 * @param {dia.CellView | dia.ElementView} srcView
 * @param {ConnectionRules} rules
 * @returns {boolean}
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

    areTargetConnectionExhausted = checkWhetherConnectionRulesAreExhausted(
      connectedElementsToTarget,
      targetRule,
    );
    areSourceConnectionsExhausted = checkWhetherConnectionRulesAreExhausted(
      connectedElementsToSource,
      sourceRule,
    );

    doesTargetIsEmbeddedWithExhaustedConnections =
      doesElementsIsEmbeddedWithExhaustedConnections(
        targetAsElement,
        connectedElementsToTarget,
        sourceAsElement,
      );

    doesSourceIsEmbeddedWithExhaustedConnections =
      doesElementsIsEmbeddedWithExhaustedConnections(
        sourceAsElement,
        connectedElementsToSource,
        targetAsElement,
      );
  }
  return (
    !areSourceConnectionsExhausted &&
    !areTargetConnectionExhausted &&
    !(
      doesTargetIsEmbeddedWithExhaustedConnections ||
      doesSourceIsEmbeddedWithExhaustedConnections
    ) &&
    (sourceRule !== undefined || targetRule !== undefined)
  );
};

/**
 * Iterate through connectedElements of some shape to check if there are possible connections left for given shape
 *
 * @param {ServiceEntityBlock[]} connectedElements
 * @param {Rule | undefined} rule
 * @returns {boolean}
 */
const checkWhetherConnectionRulesAreExhausted = (
  connectedElements: ServiceEntityBlock[],
  rule: Rule | undefined,
): boolean => {
  const targetConnectionsForGivenRule = connectedElements.filter(
    (element) => element.getName() === rule?.name,
  );

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
 * @returns {boolean}
 */
const doesElementsIsEmbeddedWithExhaustedConnections = (
  source: dia.Element,
  connectedElementsToSource: ServiceEntityBlock[],
  target: dia.Element,
): boolean => {
  const isSourceEmbedded = source.get("isEmbedded");
  const sourceHolderType = source.get("holderType");

  const targetName = target.get("entityName");

  if (isSourceEmbedded && sourceHolderType !== undefined) {
    //if source is embedded entity then check if it is already connected according to it's parent rules

    const connectedHolder = connectedElementsToSource.filter((element) => {
      //if connected shape Name to the target has the same name is the same as the sou
      return element.getName() === sourceHolderType;
    });

    const doesSourceMatchHolderType = targetName === sourceHolderType;

    return connectedHolder.length > 0 && doesSourceMatchHolderType;
  }
  return false;
};
