import {
  Command,
  Poster,
  CommandManager,
  Either,
  InstanceAttributeModel,
  Field,
} from "@/Core";
import { AttributeResultConverter, sanitizeAttributes } from "@/Data/Common";

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
    return async (fields, attributes) => {
      return this.submit(command, fields, attributes);
    };
  }

  private async submit(
    command: Command.SubCommand<"CreateInstance">,
    fields: Field[],
    attributes: InstanceAttributeModel
  ): Promise<
    Either.Type<
      Command.Error<"CreateInstance">,
      Command.ApiData<"CreateInstance">
    >
  > {
    const parsedAttributes = sanitizeAttributes(fields, attributes);
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
