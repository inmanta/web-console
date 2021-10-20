import {
  Command,
  CommandManager,
  InstanceAttributeModel,
  Maybe,
  Field,
  ApiHelper,
} from "@/Core";
import { AttributeResultConverter, sanitizeAttributes } from "@/Data/Common";

export class TriggerInstanceUpdateCommandManager implements CommandManager {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly attributeConverter: AttributeResultConverter,
    private readonly environment: string
  ) {}

  matches(command: Command.SubCommand<"TriggerInstanceUpdate">): boolean {
    return command.kind === "TriggerInstanceUpdate";
  }

  getTrigger(
    command: Command.SubCommand<"TriggerInstanceUpdate">
  ): Command.Trigger<"TriggerInstanceUpdate"> {
    return async (fields: Field[], currentAttributes, updatedAttributes) => {
      return this.submit(command, fields, currentAttributes, updatedAttributes);
    };
  }

  private async submit(
    command: Command.SubCommand<"TriggerInstanceUpdate">,
    fields: Field[],
    currentAttributes: InstanceAttributeModel | null,
    updatedAttributes: InstanceAttributeModel
  ): Promise<Maybe.Type<Command.Error<"TriggerInstanceUpdate">>> {
    // Make sure correct types are used
    const parsedAttributes = sanitizeAttributes(fields, updatedAttributes);
    // Only the difference should be sent
    const attributeDiff = this.attributeConverter.calculateDiff(
      parsedAttributes,
      currentAttributes
    );
    return await this.apiHelper.patch(this.getUrl(command), this.environment, {
      attributes: attributeDiff,
    });
  }

  private getUrl({
    service_entity,
    id,
    version,
  }: Command.SubCommand<"TriggerInstanceUpdate">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`;
  }
}
