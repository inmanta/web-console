import { ApiHelper, Command, Maybe } from "@/Core";
import { Deleter } from "@/Core/Ports/Deleter";

export class InstanceDeleter implements Deleter<"DeleteInstance"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}
  delete(command: Command.DeleteInstanceCommand): Promise<Maybe.Type<string>> {
    return this.apiHelper.delete(this.getUrl(command), this.environment);
  }

  private getUrl({
    service_entity,
    id,
    version,
  }: Command.SubCommand<"DeleteInstance">): string {
    return `${this.apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`;
  }
}
