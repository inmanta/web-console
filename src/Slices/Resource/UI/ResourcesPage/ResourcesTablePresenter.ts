import moment from "moment";
import { Resource } from "@/Core";
import { ColumnHead } from "@/UI/Presenters";
import { words } from "@/UI/words";

export const columnHeads: ColumnHead[] = [
  { displayName: words("resources.column.type"), apiName: "resource_type" },
  { displayName: words("resources.column.agent"), apiName: "agent" },
  { displayName: words("resources.column.value"), apiName: "resource_id_value" },
  { displayName: words("resources.column.status"), apiName: "status" },
];

export const sortableColumns = ["resource_type", "agent", "resource_id_value"];

export function createRows(resources: Resource.FlatResource[]): Resource.Row[] {
  return resources.map((resource) => ({
    type: resource.resourceType,
    value: resource.resourceIdValue,
    agent: resource.agent,
    status: {
      blocked: resource.state?.blocked,
      compliance: resource.state?.compliance,
      lastHandlerRun: resource.state?.lastHandlerRun,
      lastHandlerRunAt: resource.state?.lastHandlerRunAt
        ? moment.utc(resource.state.lastHandlerRunAt).format("DD MMMM YYYY, HH:mm")
        : undefined,
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
