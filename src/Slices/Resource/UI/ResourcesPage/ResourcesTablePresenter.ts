import { Resource } from "@/Core";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

const columnHeads: ColumnHead[] = [
  { displayName: words("type"), apiName: "resource_type" },
  { displayName: words("agent"), apiName: "agent" },
  { displayName: words("value"), apiName: "resource_id_value" },
  { displayName: words("status"), apiName: "status" },
];

/**
 * Table presenter for the resources page. Each row reads its own resource through its fragment,
 * so the rows are the resources themselves and the presenter mainly describes the columns.
 *
 * @example createResourcesTablePresenter().getSortableColumnNames() // ["resource_type", "agent", "resource_id_value"]
 */
export const createResourcesTablePresenter = () =>
  createTablePresenter<Resource.Resource, Resource.Resource>({
    columnHeads,
    sortableColumns: ["resource_type", "agent", "resource_id_value"],
    createRows: (resources) => resources,
  });

export type ResourcesTablePresenter = ReturnType<typeof createResourcesTablePresenter>;
