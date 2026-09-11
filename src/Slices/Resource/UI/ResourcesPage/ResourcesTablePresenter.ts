import { Resource } from "@/Core";
import { ColumnHead } from "@/UI/Presenters";
import { words } from "@/UI/words";
import { ResourceRow } from "./ResourceTableRow";

// TODO: Check if this presenter will suffice after the implementation of:
// https://github.com/inmanta/web-console/issues/6809

export const columnHeads: ColumnHead[] = [
  { displayName: words("type"), apiName: "resource_type" },
  { displayName: words("resources.column.agent"), apiName: "agent" },
  { displayName: words("value"), apiName: "resource_id_value" },
  { displayName: words("status"), apiName: "status" },
];

export const sortableColumns = ["resource_type", "agent", "resource_id_value"];

export function createRows(resources: Resource.Resource[]): ResourceRow[] {
  return resources.map((resource) => ({
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
  }));
}

export const getColumnNameForIndex = (index: number): string | undefined => {
  if (index > -1 && index < columnHeads.length + 1) {
    return columnHeads[index].apiName;
  }

  return undefined;
};

export const getIndexForColumnName = (columnName?: string): number =>
  columnHeads.findIndex((columnHead) => columnHead.apiName === columnName);
