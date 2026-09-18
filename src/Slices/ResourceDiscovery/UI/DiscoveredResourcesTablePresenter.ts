import { DiscoveredResource } from "@/Data/Queries";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

const columnHeads: ColumnHead[] = [
  { displayName: words("type"), apiName: "type" },
  { displayName: words("agent"), apiName: "agent" },
  { displayName: words("value"), apiName: "value" },
];

/**
 * Table presenter for the discovered resources view. Rows are the resources
 * unchanged, and no columns are sortable yet as the API does not support it.
 *
 * @example createDiscoveredResourcesTablePresenter().getSortableColumnNames() // []
 */
export const createDiscoveredResourcesTablePresenter = () =>
  createTablePresenter<DiscoveredResource, DiscoveredResource>({
    columnHeads,
    createRows: (resources) => resources,
  });

export type DiscoveredResourcesTablePresenter = ReturnType<
  typeof createDiscoveredResourcesTablePresenter
>;
