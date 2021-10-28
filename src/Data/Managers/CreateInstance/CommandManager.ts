import {
  Command,
  CommandManager,
  Either,
  InstanceAttributeModel,
  Field,
  ApiHelper,
} from "@/Core";
import { sanitizeAttributes } from "@/Data/Common";

export class CreateInstanceCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
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
    { service_entity }: Command.SubCommand<"CreateInstance">,
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
    return await this.apiHelper.post(
      `/lsm/v1/service_inventory/${service_entity}`,
      this.environment,
      {
        attributes: attributesWithoutNulls,
      }
    );
  }
}
