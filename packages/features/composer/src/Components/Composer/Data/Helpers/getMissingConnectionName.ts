import { ServiceModel, getServiceTitle } from "@inmanta/web-console-core";
import { MissingConnection } from "../../UI/JointJsShapes/ServiceEntityShape";

/**
 * Returns the name the composer shows for a missing connection in a shape tooltip. A related or
 * parent service shows its `web_title`, an embedded entity keeps its type.
 *
 * @example
 * getMissingConnectionName({ type: "relation", entityType: "parent-service", name: "parent" }, serviceModels)
 * // "parent (Parent)" when parent-service has the web_title "Parent"
 */
export const getMissingConnectionName = (
  connection: Pick<MissingConnection, "type" | "entityType" | "name">,
  serviceModels: ServiceModel[]
): string => {
  const { type, entityType, name } = connection;

  if (type === "embedded") {
    return entityType && entityType !== name ? `${name} (${entityType})` : name;
  }

  const relatedServiceModel = serviceModels.find(
    (serviceModel) => serviceModel.name === entityType
  );
  const relatedServiceTitle = getServiceTitle(entityType, relatedServiceModel);

  if (type === "parent") {
    return relatedServiceTitle;
  }

  return relatedServiceTitle !== name ? `${name} (${relatedServiceTitle})` : name;
};
