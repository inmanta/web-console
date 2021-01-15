import { IServiceInstanceModel } from "@app/Models/LsmModels";

export interface Row {
  id: string;
  state: string;
}

export class RowPresenter {
  createFromInstances(instances: IServiceInstanceModel[]): Row[] {
    return instances.map(instanceToRow);
  }
}

function instanceToRow(instance: IServiceInstanceModel): Row {
  return {
    id: transformId(instance.id),
    state: instance.state,
  };
}

function transformId(id: string): string {
  return id.substring(0, 4);
}
