import { ui } from "@joint/plus";
import { ServiceModel, getServiceTitle } from "@inmanta/web-console-core";

/**
 * Creates the stencil group configs for the given service names, so each group header shows the
 * `web_title` of its service. The label is a text element, so JointJS never reads the title as HTML.
 * The groups keep the service name as key and the order of `serviceNames`.
 */
export const createStencilGroups = (
  serviceNames: string[],
  serviceModels: ServiceModel[]
): Record<string, ui.Stencil.Group> => {
  const stencilGroups: Record<string, ui.Stencil.Group> = {};

  serviceNames.forEach((serviceName, index) => {
    const serviceModel = serviceModels.find((model) => model.name === serviceName);
    const label = document.createElement("span");

    label.textContent = getServiceTitle(serviceName, serviceModel);
    stencilGroups[serviceName] = { index, label };
  });

  return stencilGroups;
};
