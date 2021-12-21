import { omit } from "lodash";
import {
  Command,
  CommandManager,
  Either,
  Maybe,
  ApiHelper,
  UpdaterWithEnv,
} from "@/Core";

export class CreateCallbackCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetCallbacks">,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"CreateCallback">): boolean {
    return command.kind === "CreateCallback";
  }

  getTrigger(
    command: Command.SubCommand<"CreateCallback">
  ): Command.Trigger<"CreateCallback"> {
    return async () => {
      const result = await this.apiHelper.post(
        "/lsm/v1/callbacks",
        this.environment,
        omit(command, "kind")
      );
      if (Either.isLeft(result)) {
        return Maybe.some(result.value);
      } else {
        await this.updater.update(
          {
            kind: "GetCallbacks",
            service_entity: command.service_entity,
          },
          this.environment
        );
        return Maybe.none();
      }
    };
  }
}
