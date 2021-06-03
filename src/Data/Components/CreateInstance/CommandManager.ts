import {
  Command,
  Poster,
  CommandManager,
  FormAttributeResult,
  Either,
} from "@/Core";
import { AttributeResultConverter } from "@/Data/Common";

export class CreateInstanceCommandManager implements CommandManager {
  constructor(
    private readonly poster: Poster<"CreateInstance">,
    private readonly attributeConverter: AttributeResultConverter
  ) {}

  matches(command: Command.SubCommand<"CreateInstance">): boolean {
    return command.kind === "CreateInstance";
  }

  getTrigger(
    command: Command.SubCommand<"CreateInstance">
  ): Command.Trigger<"CreateInstance"> {
    return async (attributes) => {
      return this.submit(command, attributes);
    };
  }

  private async submit(
    command: Command.SubCommand<"CreateInstance">,
    attributes: FormAttributeResult[]
  ): Promise<
    Either.Type<
      Command.Error<"CreateInstance">,
      Command.ApiData<"CreateInstance">
    >
  > {
    const parsedAttributes =
      this.attributeConverter.parseAttributesToCorrectTypes(attributes);
    // Don't set optional attributes explicitly to null on creation
    const attributesWithoutNulls = Object.entries(parsedAttributes).reduce(
      (obj, [k, v]) => (v === null ? obj : ((obj[k] = v), obj)),
      {}
    );
    return await this.poster.post(command, {
      attributes: attributesWithoutNulls,
    });
  }
}
