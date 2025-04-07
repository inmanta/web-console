import { dia } from "@inmanta/rappid";
import { DirectedGraph } from "@joint/layout-directed-graph";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import {
  CreateModifierHandler,
  FieldCreator,
  createFormState,
} from "@/UI/Components/ServiceInstanceForm";
import { dispatchUpdateStencil } from "../Context/dispatchers";
import { EventActionEnum } from "../interfaces";
import { ServiceEntityBlock } from "../shapes";
import { connectEntities, createComposerEntity } from "./general";

/**
 * Populates a graph with default required entities derived from a service model.
 *
 * @param {dia.Graph} graph - The jointJS graph to populate.
 * @param {ServiceModel} serviceModel - The service model to use for populating the graph.
 * @returns {void}
 */
export function populateGraphWithDefault(
  graph: dia.Graph,
  serviceModel: ServiceModel,
): void {
  //the most reliable way to get attributes default state is to use Field Creator

  const fieldCreator = new FieldCreator(new CreateModifierHandler());
  const fields = fieldCreator.attributesToFields(serviceModel.attributes);

  const coreEntity = createComposerEntity({
    serviceModel,
    isCore: true,
    isInEditMode: false,
    attributes: createFormState(fields),
  });

  coreEntity.addTo(graph);

  const defaultEntities = addDefaultEntities(graph, serviceModel);

  defaultEntities.forEach((entity) => {
    entity.set("embeddedTo", coreEntity.id);
  });
  connectEntities(graph, coreEntity, defaultEntities);

  DirectedGraph.layout(graph, {
    nodeSep: 80,
    edgeSep: 80,
    rankDir: "BT",
  });
}

/**
 * Adds default entities to a graph based on a service model or an embedded entity.
 *
 * @param {dia.Graph} graph - The jointJS graph to which entities should be added.
 * @param {ServiceModel | EmbeddedEntity} service - The service model or embedded entity used to generate the default entities.
 * @returns {ServiceEntityBlock[]} An array of service entity blocks that have been added to the graph.
 */
export function addDefaultEntities(
  graph: dia.Graph,
  service: ServiceModel | EmbeddedEntity,
): ServiceEntityBlock[] {
  const embedded_entities = service.embedded_entities
    .filter((embedded_entity) => embedded_entity.lower_limit > 0)
    .flatMap((embedded_entity) => {
      const fieldCreator = new FieldCreator(new CreateModifierHandler());
      const fields = fieldCreator.attributesToFields(
        embedded_entity.attributes,
      );
      const attributes = createFormState(fields);

      if (embedded_entity.lower_limit > 1) {
        const embedded_entities: ServiceEntityBlock[] = [];

        for (let i = 0; i < embedded_entity.lower_limit; i++) {
          embedded_entities.push(
            addSingleEntity(graph, embedded_entity, attributes, service.name),
          );
        }

        return embedded_entities;
      }

      return addSingleEntity(graph, embedded_entity, attributes, service.name);
    });

  return embedded_entities;
}

/**
 * Helper function to add single default Embedded Entity to the graph - it's created to avoid code duplication in the addDefaultEntities function
 *
 * @param {dia.Graph} graph - The jointJS graph to which entities should be added.
 * @param {EmbeddedEntity} service - The service model or embedded entity used to generate the default entities.
 * @param {InstanceAttributeModel} attributes - attributes of given instance/entity
 * @param {string} holderName - name of the entity to which it is embedded/connected
 * @returns {ServiceEntityBlock}
 */
const addSingleEntity = (
  graph: dia.Graph,
  model: EmbeddedEntity,
  attributes: InstanceAttributeModel,
  holderName: string,
): ServiceEntityBlock => {
  const embeddedEntity = createComposerEntity({
    serviceModel: model,
    isCore: false,
    isInEditMode: false,
    attributes,
    isEmbeddedEntity: true,
    holderName,
  });

  dispatchUpdateStencil(model.name, EventActionEnum.ADD);

  embeddedEntity.addTo(graph);
  const subEmbeddedEntities = addDefaultEntities(graph, model);

  subEmbeddedEntities.forEach((entity) => {
    entity.set("embeddedTo", embeddedEntity.id);
  });
  connectEntities(graph, embeddedEntity, subEmbeddedEntities);

  return embeddedEntity;
};
