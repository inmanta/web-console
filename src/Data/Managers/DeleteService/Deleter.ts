import { ApiHelper, Command, Maybe, Deleter } from "@/Core";

export class ServiceDeleter implements Deleter<"DeleteService"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}
  delete(
    command: Command.SubCommand<"DeleteService">
  ): Promise<Maybe.Type<string>> {
    return this.apiHelper.delete(this.getUrl(command), this.environment);
  }

  private getUrl({ name }: Command.SubCommand<"DeleteService">): string {
    return `/lsm/v1/service_catalog/${name}`;
  }
}
