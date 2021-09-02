import {
  Command,
  Poster,
  CommandManager,
  Updater,
  Either,
  Maybe,
} from "@/Core";

export class CreateCallbackCommandManager implements CommandManager {
  constructor(
    private readonly poster: Poster<"CreateCallback">,
    private readonly updater: Updater<"Callbacks">
  ) {}

  matches(command: Command.SubCommand<"CreateCallback">): boolean {
    return command.kind === "CreateCallback";
  }

  getTrigger(
    command: Command.SubCommand<"CreateCallback">
  ): Command.Trigger<"CreateCallback"> {
    return async () => {
      const { callback_url, callback_id, service_entity } = command;
      const result = await this.poster.post(command, {
        callback_url,
        callback_id,
        service_entity,
      });
      if (Either.isLeft(result)) {
        return Maybe.some(result.value);
      } else {
        await this.updater.update({ kind: "Callbacks", service_entity });
        return Maybe.none();
      }
    };
  }
}
