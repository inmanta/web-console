import { dia } from "@inmanta/rappid";
import {
  EmbeddedEntity,
  InstanceAttributeModel,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
import { create_UUID } from "@/Slices/EditInstance/Data";
import { ConnectionRules, InstanceForApi, Rule } from "./interfaces";
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

/**
 * Function that will merge state from Instance Composer to proper object for order_api endpoint.
 * Instance composer state is being split into multiple objects that could be embedded into other available, so we need to recursively
 * go through all of them to group, and sort them
 * @param {InstanceForApi[]} instances all of the instances that were created/edited in the instance, not including the one passed in second parameter
 * @param {InstanceForApi} instance instance which is used taken into consideration as the parent of the possible embedded
 * @param {boolean=} isEmbedded boolean informing whether instance passed is embedded or not
 * @returns
 */
export const shapesDataTransform = (
  instances: InstanceForApi[],
  instance: InstanceForApi,
  isEmbedded = false,
) => {
  let areEmbeddedEdited = false;
  const matchingInstances = instances.filter(
    (checkedInstance) => checkedInstance.embeddedTo === instance.instance_id,
  );

  const notMatchingInstances = instances.filter(
    (checkedInstance) => checkedInstance.embeddedTo !== instance.instance_id,
  );

  //iterate through matching (embedded)instances and group them according to property type to be able to put them in the Array if needed at once
  const groupedEmbedded: { [instanceId: string]: InstanceForApi[] } =
    matchingInstances.reduce((reducer, instance) => {
      reducer[instance.service_entity] = reducer[instance.service_entity] || [];
      reducer[instance.service_entity].push(instance);
      return reducer;
    }, Object.create({}));

  for (const [key, instancesToEmbed] of Object.entries(groupedEmbedded)) {
    if (instance.value) {
      if (instancesToEmbed.length > 1) {
        const updated: InstanceAttributeModel[] = [];
        instancesToEmbed.forEach((instance) => {
          const updatedInstance = shapesDataTransform(
            notMatchingInstances,
            instance,
            true,
          );

          areEmbeddedEdited =
            !areEmbeddedEdited &&
            !instance.action &&
            updatedInstance.action !== null;

          if (updatedInstance.action !== "delete") {
            updated.push(updatedInstance.value as InstanceAttributeModel);
          }
        });

        instance.value[key] = updated;
      } else {
        const data = shapesDataTransform(
          notMatchingInstances,
          instancesToEmbed[0],
          true,
        );

        areEmbeddedEdited = instance.action === null && data.action !== null;

        if (data.action !== "delete") {
          instance.value[key] = data.value;
        }
      }
    }
  }

  //convert relatedTo property into valid attribute
  if (instance.relatedTo) {
    instance.relatedTo.forEach((attrName, id) => {
      if (instance.value) {
        instance.value[attrName] = id;
      }
    });
  }

  //if any of its embedded instances were edited, and its action is indicating no changes to main attributes, change it to "update"
  if (areEmbeddedEdited) {
    instance.action = "update";
  }

  //if its action is "update" and instance isn't embedded change value property to edit as that's what api expect in the body
  if (instance.action === "update" && !isEmbedded) {
    if (!!instance.value && !instance.edit) {
      instance.edit = [
        {
          edit_id: `${instance.instance_id}_order_update-${create_UUID()}`,
          operation: "replace",
          target: ".",
          value: instance.value,
        },
      ];
    }
    delete instance.value;
  }

  delete instance.embeddedTo;
  delete instance.relatedTo;
  return instance;
};

/**
 * Function that takes Map of standalone instances that include core, embedded and related entities and
 * bundle in proper Instance Objects that could be accepted by the order_api request
 *
 * @param {Map<string, InstanceForApi>}instances Map of Instances
 * @param {ServiceModel[]} services
 * @returns InstanceForApi[]
 */
export const bundleInstances = (
  instances: Map<string, InstanceForApi>,
  services: ServiceModel[],
) => {
  const mapToArray = Array.from(instances, (instance) => instance[1]); //only value, the id is stored in the object anyway
  const topServicesNames = services.map((service) => service.name);
  const topInstances = mapToArray.filter((instance) =>
    topServicesNames.includes(instance.service_entity),
  );
  const embeddedInstances = mapToArray.filter(
    (instance) => !topServicesNames.includes(instance.service_entity),
  );

  return topInstances.map((instance) =>
    shapesDataTransform(embeddedInstances, instance),
  );
};
