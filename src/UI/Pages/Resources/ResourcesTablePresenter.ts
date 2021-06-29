import { LatestReleasedResource, LatestReleasedResourceRow } from "@/Core";
import { TablePresenter } from "@/UI/Presenters";

export class ResourcesTablePresenter
  implements TablePresenter<LatestReleasedResource, LatestReleasedResourceRow>
{
  readonly columnHeads: string[];
  readonly numberOfColumns: number;

  constructor() {
    this.columnHeads = [
      "Type",
      "Agent",
      "Value",
      "Number of dependencies",
      "Deploy state",
    ];
    this.numberOfColumns = this.columnHeads.length + 1;
  }

  createRows(
    sourceData: LatestReleasedResource[]
  ): LatestReleasedResourceRow[] {
    return sourceData.map((resource) => ({
      type: resource.id_details.resource_type,
      value: resource.id_details.resource_id_value,
      agent: resource.id_details.agent,
      deployState: resource.status,
      numberOfDependencies: resource.requires.length,
      id: resource.resource_id,
    }));
  }
  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads;
  }
  getNumberOfColumns(): number {
    return this.numberOfColumns;
  }
}
