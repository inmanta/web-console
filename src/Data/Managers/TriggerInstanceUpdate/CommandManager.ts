import {
  Command,
  CommandManager,
  Patcher,
  InstanceAttributeModel,
  Maybe,
  Field,
} from "@/Core";
import { AttributeResultConverter } from "@/Data/Common";

export class TriggerInstanceUpdateCommandManager implements CommandManager {
  constructor(
    private readonly patcher: Patcher<"TriggerInstanceUpdate">,
    private readonly attributeConverter: AttributeResultConverter
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
    // const parsedAttributes =
    // this.attributeConverter.parseAttributesToCorrectTypes(updatedAttributes);
    // Only the difference should be sent
    const attributeDiff = this.attributeConverter.calculateDiff(
      updatedAttributes,
      currentAttributes
    );
    return await this.patcher.patch(command, {
      attributes: attributeDiff,
    });
  }
}
