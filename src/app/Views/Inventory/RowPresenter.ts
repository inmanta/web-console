import { ServiceInstance } from "@app/Core";
import { DatePresenter, DateInfo } from "./DatePresenter";
import { AttributeInfo, AttributePresenter } from "./AttributePresenter";

export interface Row {
  id: string;
  state: string;
  attributes: AttributeInfo;
  createdAt: DateInfo;
  updatedAt: DateInfo;
}

/**
 * The RowPresenter is responsible for formatting the domain data.
 */
export class RowPresenter {
  constructor(
    private datePresenter: DatePresenter,
    private attributePresenter: AttributePresenter
  ) {}

  public createFromInstances(instances: ServiceInstance[]): Row[] {
    return instances.map((instance) => this.instanceToRow(instance));
  }

  private instanceToRow(instance: ServiceInstance): Row {
    const {
      id,
      state,
      candidate_attributes,
      active_attributes,
      rollback_attributes,
      created_at,
      last_updated,
    } = instance;

    return {
      id: this.transformId(id),
      state,
      attributes: this.attributePresenter.get(
        candidate_attributes,
        active_attributes,
        rollback_attributes
      ),
      createdAt: this.datePresenter.get(created_at),
      updatedAt: this.datePresenter.get(last_updated),
    };
  }

  private transformId(id: string): string {
    return id.substring(0, 4);
  }
}
