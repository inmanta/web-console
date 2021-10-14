import { ApiHelper, Command, Maybe, Deleter } from "@/Core";

export class EnvironmentDeleter implements Deleter<"DeleteEnvironment"> {
  constructor(private readonly apiHelper: ApiHelper) {}

  delete(command: Command.DeleteEnvironment): Promise<Maybe.Type<string>> {
    return this.apiHelper.delete(this.getUrl(command), command.id);
  }

  private getUrl({ id }: Command.SubCommand<"DeleteEnvironment">): string {
    return `${this.apiHelper.getBaseUrl()}/api/v2/environment/${id}`;
  }
}
