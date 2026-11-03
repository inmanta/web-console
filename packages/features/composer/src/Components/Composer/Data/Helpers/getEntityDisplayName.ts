import { EmbeddedEntity, ServiceModel, resolveEntityAnnotations } from "@inmanta/web-console-core";

/**
 * Returns the name the composer shows for an entity in a shape header or a stencil item.
 * A service shows its `web_title`, an embedded entity shows "type - name", or only its name
 * when it has no type.
 */
export const getEntityDisplayName = (entity: ServiceModel | EmbeddedEntity): string => {
  if (!("type" in entity)) {
    return resolveEntityAnnotations(entity).web_title;
  }

  return entity.type ? `${entity.type} - ${entity.name}` : entity.name;
};
