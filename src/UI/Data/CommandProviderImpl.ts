import {
  CommandProvider,
  Command,
  RemoteData,
  ApiHelper,
  StateHelper,
} from "@/Core";

export class CommandProviderImpl implements CommandProvider {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"InstanceConfig">
  ) {}
  getTrigger({
    qualifier,
  }: Command.SubCommand<"InstanceConfig">): Command.Trigger<"InstanceConfig"> {
    return async (payload) => {
      switch (payload.kind) {
        case "RESET":
          this.reset(qualifier);
          return;
        case "UPDATE":
          this.update(qualifier, payload.option, payload.value);
      }
    };
  }

  private async update(
    qualifier: Command.Qualifier<"InstanceConfig">,
    option: string,
    value: boolean
  ): Promise<void> {
    const data = this.stateHelper.getOnce(qualifier);
    if (!RemoteData.isSuccess(data)) return;
    const config = data.value;
    const newConfig = {
      ...config,
      [option]: value,
    };
    const url = `${this.apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${
      qualifier.service_entity
    }/${qualifier.id}/config?current_version=${qualifier.version}`;
    const response = await this.apiHelper.post<
      Command.ApiData<"InstanceConfig">,
      Command.Offer<"InstanceConfig">
    >(url, qualifier.environment, { values: newConfig });

    this.stateHelper.set(qualifier, RemoteData.fromEither(response));
  }

  private async reset(
    qualifier: Command.Qualifier<"InstanceConfig">
  ): Promise<void> {
    const url = `${this.apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${
      qualifier.service_entity
    }/${qualifier.id}/config?current_version=${qualifier.version}`;
    const response = await this.apiHelper.post<
      Command.ApiData<"InstanceConfig">,
      Command.Offer<"InstanceConfig">
    >(url, qualifier.environment, { values: {} });

    this.stateHelper.set(qualifier, RemoteData.fromEither(response));
  }
}
