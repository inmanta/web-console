import { ApiHelper, Command, Maybe, Patcher } from "@/Core";

export class TriggerInstanceUpdatePatcher
  implements Patcher<"TriggerInstanceUpdate">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  private getUrl({
    service_entity,
    id,
    version,
  }: Command.SubCommand<"TriggerInstanceUpdate">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`;
  }

  patch(
    command: Command.SubCommand<"TriggerInstanceUpdate">,
    body: Command.Body<"TriggerInstanceUpdate">
  ): Promise<Maybe.Type<Command.Error<"TriggerInstanceUpdate">>> {
    return this.apiHelper.patch<Command.Body<"TriggerInstanceUpdate">>(
      this.getUrl(command),
      this.environment,
      body
    );
  }
}
