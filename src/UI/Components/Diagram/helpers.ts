import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, ServiceInstanceModel, ServiceModel } from "@/Core";
import { ConnectionRules, Rule } from "./interfaces";

export const extractRelationsIds = (
  service: ServiceModel,
  instance: ServiceInstanceModel
): string[] => {
  const relationKeys = service.inter_service_relations?.map(
    (relation) => relation.name
  );
  if (!relationKeys) {
    return [];
  }
  if (instance.candidate_attributes !== null) {
    return relationKeys
      .map((key) =>
        instance.candidate_attributes !== null
          ? instance.candidate_attributes[key]
          : undefined
      )
      .filter((value) => value !== undefined) as string[];
  } else if (instance.active_attributes !== null) {
    return relationKeys
      .map((key) =>
        instance.active_attributes !== null
          ? instance.active_attributes[key]
          : undefined
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
  }
): ConnectionRules => {
  services.map((service) => {
    if (rules[service.name] === undefined) {
      rules[service.name] = [];
    }
    const tempRules: Rule[] = [];
    service.embedded_entities.map((entity) => {
      tempRules.push({
        name: entity.name,
        upperLimit: entity.upper_limit || null,
      });

      createConnectionRules([entity], rules);
    });

    if (service.inter_service_relations) {
      service.inter_service_relations.map((relation) => {
        tempRules.push({
          name: relation.entity_type,
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
  rules: ConnectionRules
): boolean => {
  let areSourceConnectionsExhausted = false;
  let areTargetConnectionExhausted = false;

  const targetName = tgtView?.model.attr(["headerLabel", "text"]);
  const sourceName = srcView.model.attr(["headerLabel", "text"]);
  const targetRule = rules[targetName].find(
    (object) => object.name === sourceName
  );

  const sourceRule = rules[sourceName].find(
    (object) => object.name === targetName
  );

  //to receive neighbors we need to convert celView to Element
  const allElements = graph.getElements();
  const sourceAsElement = allElements.find(
    (element) => element.cid === srcView.model.cid
  );
  const targetAsElement = allElements.find(
    (element) => element.cid === tgtView?.model.cid
  );

  if (sourceAsElement && targetAsElement) {
    const connectedElementsToSource = graph.getNeighbors(sourceAsElement);
    const connectedElementsToTarget = graph.getNeighbors(targetAsElement);

    const targetConnectionsForGivenRule = connectedElementsToTarget.filter(
      (element) => element.attr(["headerLabel", "text"]) === targetRule?.name
    );
    const sourceConnectionsForGivenRule = connectedElementsToSource.filter(
      (element) => element.attr(["headerLabel", "text"]) === sourceRule?.name
    );

    //undefined and null are equal to no limit
    if (
      targetRule?.upperLimit !== undefined &&
      targetRule?.upperLimit !== null
    ) {
      areTargetConnectionExhausted =
        targetConnectionsForGivenRule.length >= targetRule?.upperLimit;
    } else {
      areTargetConnectionExhausted = false;
    }

    if (
      sourceRule?.upperLimit !== undefined &&
      sourceRule?.upperLimit !== null
    ) {
      areSourceConnectionsExhausted =
        sourceConnectionsForGivenRule.length >= sourceRule?.upperLimit;
    } else {
      areSourceConnectionsExhausted = false;
    }
  }
  return (
    !areSourceConnectionsExhausted &&
    !areTargetConnectionExhausted &&
    (sourceRule !== undefined || targetRule !== undefined)
  );
};
