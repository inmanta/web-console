import {
  Command,
  CommandManager,
  Updater,
  Either,
  Maybe,
  ApiHelper,
} from "@/Core";
import { omit } from "lodash";

export class CreateCallbackCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"Callbacks">,
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
        await this.updater.update({
          kind: "Callbacks",
          service_entity: command.service_entity,
        });
        return Maybe.none();
      }
    };
  }
}
