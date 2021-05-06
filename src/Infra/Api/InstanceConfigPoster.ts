import { ApiHelper, Command, Poster } from "@/Core";
import { Type } from "@/Core/Language/Either";

export class InstanceConfigPoster implements Poster<"InstanceConfig"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  private getUrl({
    service_entity,
    id,
    version,
  }: Command.Qualifier<"InstanceConfig">): string {
    return `${this.apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${service_entity}/${id}/config?current_version=${version}`;
  }

  post(
    qualifier: Command.Qualifier<"InstanceConfig">,
    body: Command.Body<"InstanceConfig">
  ): Promise<Type<string, Command.ApiData<"InstanceConfig">>> {
    return this.apiHelper.post<
      Command.ApiData<"InstanceConfig">,
      Command.Body<"InstanceConfig">
    >(this.getUrl(qualifier), this.environment, body);
  }
}
