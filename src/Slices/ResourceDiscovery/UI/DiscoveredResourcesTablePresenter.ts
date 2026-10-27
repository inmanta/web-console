import { words } from "@/Core";
import { DiscoveredResource } from "@/Data/Queries/Slices/DiscoveredResources";
import { createTablePresenter } from "@/UI/Presenters";

/**
 * Table presenter for the discovered resources view. Rows are the resources
 * unchanged, and no columns are sortable yet as the API does not support it.
 *
 * @example createDiscoveredResourcesTablePresenter().getSortableColumnNames() // []
 */
export const createDiscoveredResourcesTablePresenter = () =>
  createTablePresenter<DiscoveredResource, DiscoveredResource>({
    columnHeads: [
      { displayName: words("type"), apiName: "type" },
      { displayName: words("agent"), apiName: "agent" },
      { displayName: words("value"), apiName: "value" },
    ],
    createRows: (resources) => resources,
  });

export type DiscoveredResourcesTablePresenter = ReturnType<
  typeof createDiscoveredResourcesTablePresenter
>;
