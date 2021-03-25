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
    return async (name: string, value: boolean) => {
      const data = this.stateHelper.getOnce(qualifier);
      if (!RemoteData.isSuccess(data)) return;
      const config = data.value;
      const newConfig = {
        ...config,
        [name]: value,
      };
      const url = `${this.apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${
        qualifier.service_entity
      }/${qualifier.id}/config?current_version=${qualifier.version}`;
      const response = await this.apiHelper.post<
        Command.ApiData<"InstanceConfig">,
        Command.Offer<"InstanceConfig">
      >(url, qualifier.environment, { config: newConfig });

      this.stateHelper.set(qualifier, RemoteData.fromEither(response));
    };
  }
}
