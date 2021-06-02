import { ApiHelper, Command, Patcher } from "@/Core";
import { Type } from "@/Core/Language/Either";

export class UpdateInstancePatcher implements Patcher<"UpdateInstance"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  private getUrl({
    service_entity,
    id,
    version,
  }: Command.SubCommand<"UpdateInstance">): string {
    return `${this.apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`;
  }

  patch(
    command: Command.SubCommand<"UpdateInstance">,
    body: Command.Body<"UpdateInstance">
  ): Promise<Type<string, Command.ApiData<"UpdateInstance">>> {
    return this.apiHelper.patch<Command.Body<"UpdateInstance">>(
      this.getUrl(command),
      this.environment,
      body
    );
  }
}
