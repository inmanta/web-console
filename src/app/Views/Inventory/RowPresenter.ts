import { ServiceInstance } from "@app/Core";
import { DatePresenter, DateInfo } from "./DatePresenter";

export interface Row {
  id: string;
  state: string;
  createdAt: DateInfo;
  updatedAt: DateInfo;
}

export class RowPresenter {
  constructor(private datePresenter: DatePresenter) {}

  public createFromInstances(instances: ServiceInstance[]): Row[] {
    return instances.map((instance) => this.instanceToRow(instance));
  }

  private instanceToRow(instance: ServiceInstance): Row {
    return {
      id: this.transformId(instance.id),
      state: instance.state,
      createdAt: this.datePresenter.get(instance.created_at),
      updatedAt: this.datePresenter.get(instance.last_updated),
    };
  }

  private transformId(id: string): string {
    return id.substring(0, 4);
  }
}
