import { Resource, words } from "@inmanta/web-console-core";
import { createTablePresenter } from "@inmanta/web-console-ui/Presenters";
import { RowFromVersion } from "./Row";

/**
 * Table presenter for the resources of a desired state version.
 *
 * @example createVersionResourceTablePresenter().getSortableColumnNames() // ["resource_type", "agent", "resource_id_value"]
 */
export const createVersionResourceTablePresenter = () =>
  createTablePresenter<Resource.FromVersionResource, RowFromVersion>({
    columnHeads: [
      { displayName: words("type"), apiName: "resource_type" },
      { displayName: words("agent"), apiName: "agent" },
      { displayName: words("value"), apiName: "resource_id_value" },
      { displayName: words("requires"), apiName: "requires" },
    ],
    sortableColumns: ["resource_type", "agent", "resource_id_value"],
    createRows: (resources) =>
      resources.map((resource) => ({
        type: resource.id_details.resource_type,
        value: resource.id_details.resource_id_value,
        agent: resource.id_details.agent,
        numberOfDependencies: resource.requires.length,
        id: resource.resource_id,
      })),
  });

export type VersionResourceTablePresenter = ReturnType<typeof createVersionResourceTablePresenter>;
