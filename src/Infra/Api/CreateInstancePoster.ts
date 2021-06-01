import { ApiHelper, Command, Poster } from "@/Core";
import { Type } from "@/Core/Language/Either";

export class CreateInstancePoster implements Poster<"CreateInstance"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  private getUrl({
    service_entity,
  }: Command.SubCommand<"CreateInstance">): string {
    return `${this.apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${service_entity}`;
  }

  post(
    command: Command.SubCommand<"CreateInstance">,
    body: Command.Body<"CreateInstance">
  ): Promise<Type<string, Command.ApiData<"CreateInstance">>> {
    return this.apiHelper.post<
      Command.ApiData<"CreateInstance">,
      Command.Body<"CreateInstance">
    >(this.getUrl(command), this.environment, body);
  }
}
