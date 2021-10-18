import { ApiHelper, Command, Maybe, PosterWithoutResponse } from "@/Core";

export class SetStatePoster
  implements PosterWithoutResponse<"TriggerSetState">
{
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
  ): Promise<Maybe.Type<Command.Error<"TriggerSetState">>> {
    return this.apiHelper.postWithoutResponse<Command.Body<"TriggerSetState">>(
      this.getUrl(command),
      this.environment,
      body
    );
  }
}
