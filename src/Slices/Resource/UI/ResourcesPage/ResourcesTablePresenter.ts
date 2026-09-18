import { Resource } from "@/Core";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import { ResourceRow } from "./ResourceTableRow";

const columnHeads: ColumnHead[] = [
  { displayName: words("type"), apiName: "resource_type" },
  { displayName: words("agent"), apiName: "agent" },
  { displayName: words("value"), apiName: "resource_id_value" },
  { displayName: words("status"), apiName: "status" },
];

/**
 * Table presenter for the resources page.
 *
 * @example createResourcesTablePresenter().getSortableColumnNames() // ["resource_type", "agent", "resource_id_value"]
 */
export const createResourcesTablePresenter = () =>
  createTablePresenter<Resource.Resource, ResourceRow>({
    columnHeads,
    sortableColumns: ["resource_type", "agent", "resource_id_value"],
    createRows: (resources) =>
      resources.map((resource) => ({
        type: resource.resourceType,
        value: resource.resourceIdValue,
        agent: resource.agent,
        status: {
          blocked: resource.state?.blocked,
          compliance: resource.state?.compliance,
          lastHandlerRun: resource.state?.lastHandlerRun,
          lastHandlerRunAt: resource.state?.lastHandlerRunAt,
          isDeploying: resource.state?.isDeploying,
          isOrphan: resource.state?.isOrphan,
        },
        requiresLength: resource.requiresLength,
        id: resource.resourceId,
      })),
  });

export type ResourcesTablePresenter = ReturnType<typeof createResourcesTablePresenter>;
