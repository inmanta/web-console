import { Resource } from "@/Core";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import { RowFromVersion } from "./Row";

const columnHeads: ColumnHead[] = [
  { displayName: words("type"), apiName: "resource_type" },
  { displayName: words("agent"), apiName: "agent" },
  { displayName: words("value"), apiName: "resource_id_value" },
  { displayName: words("requires"), apiName: "requires" },
];

/**
 * Table presenter for the resources of a desired state version.
 *
 * @example createVersionResourceTablePresenter().getSortableColumnNames() // ["resource_type", "agent", "resource_id_value"]
 */
export const createVersionResourceTablePresenter = () =>
  createTablePresenter<Resource.FromVersionResource, RowFromVersion>({
    columnHeads,
    sortableColumns: ["resource_type", "agent", "resource_id_value"],
    extraColumns: 2,
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
