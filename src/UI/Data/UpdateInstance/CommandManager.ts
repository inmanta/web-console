import {
  Command,
  CommandManager,
  FormAttributeResult,
  Either,
  Patcher,
  InstanceAttributeModel,
} from "@/Core";
import { AttributeResultConverter } from "@/UI/Data/Common";

export class UpdateInstanceCommandManager implements CommandManager {
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
    return async (currentAttributes, updatedAttributes) => {
      return this.submit(command, currentAttributes, updatedAttributes);
    };
  }

  private async submit(
    command: Command.SubCommand<"TriggerInstanceUpdate">,
    currentAttributes: InstanceAttributeModel | null,
    updatedAttributes: FormAttributeResult[]
  ): Promise<
    Either.Type<
      Command.Error<"TriggerInstanceUpdate">,
      Command.ApiData<"TriggerInstanceUpdate">
    >
  > {
    // Make sure correct types are used
    const parsedAttributes =
      this.attributeConverter.parseAttributesToCorrectTypes(updatedAttributes);
    // Only the difference should be sent
    const attributeDiff = this.attributeConverter.calculateDiff(
      parsedAttributes,
      currentAttributes
    );
    return await this.patcher.patch(command, {
      attributes: attributeDiff,
    });
  }
}
