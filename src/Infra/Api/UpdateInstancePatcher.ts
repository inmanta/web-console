import { ApiHelper, Command, Patcher } from "@/Core";
import { Type } from "@/Core/Language/Either";

export class UpdateInstancePatcher implements Patcher<"TriggerInstanceUpdate"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  private getUrl({
    service_entity,
    id,
    version,
  }: Command.SubCommand<"TriggerInstanceUpdate">): string {
    return `${this.apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`;
  }

  patch(
    command: Command.SubCommand<"TriggerInstanceUpdate">,
    body: Command.Body<"TriggerInstanceUpdate">
  ): Promise<Type<string, Command.ApiData<"TriggerInstanceUpdate">>> {
    return this.apiHelper.patch<Command.Body<"TriggerInstanceUpdate">>(
      this.getUrl(command),
      this.environment,
      body
    );
  }
}
