import { IServiceInstanceModel } from "@app/Models/LsmModels";

export interface Row {
  id: string;
}

export class RowPresenter {
  createFromInstances(instances: IServiceInstanceModel[]): Row[] {
    return instances.map(this.instanceToRow);
  }

  private instanceToRow(instance: IServiceInstanceModel): Row {
    return {
      id: instance.id,
    };
  }
}
