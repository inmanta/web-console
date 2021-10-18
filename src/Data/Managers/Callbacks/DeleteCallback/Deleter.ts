import { ApiHelper, Command, Maybe, Deleter } from "@/Core";

export class CallbackDeleter implements Deleter<"DeleteCallback"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  delete(command: Command.DeleteCallbackCommand): Promise<Maybe.Type<string>> {
    return this.apiHelper.delete(this.getUrl(command), this.environment);
  }

  private getUrl({ callbackId }: Command.SubCommand<"DeleteCallback">): string {
    return `${this.apiHelper.getBaseUrl()}/lsm/v1/callbacks/${callbackId}`;
  }
}
