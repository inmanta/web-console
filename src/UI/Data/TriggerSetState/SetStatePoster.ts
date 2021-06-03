import { ApiHelper, Command, Poster } from "@/Core";
import { Type } from "@/Core/Language/Either";

export class SetStatePoster implements Poster<"TriggerSetState"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  private getUrl({
    service_entity,
    id,
  }: Command.SubCommand<"TriggerSetState">): string {
    return `${this.apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${service_entity}/${id}/state`;
  }

  post(
    command: Command.SubCommand<"TriggerSetState">,
    body: Command.Body<"TriggerSetState">
  ): Promise<Type<string, Command.ApiData<"TriggerSetState">>> {
    return this.apiHelper.postEmptyResponse<Command.Body<"TriggerSetState">>(
      this.getUrl(command),
      this.environment,
      body
    );
  }
}
