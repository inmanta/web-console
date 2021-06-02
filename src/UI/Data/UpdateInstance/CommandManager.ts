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
    private readonly patcher: Patcher<"UpdateInstance">,
    private readonly attributeConverter: AttributeResultConverter
  ) {}

  matches(command: Command.SubCommand<"UpdateInstance">): boolean {
    return command.kind === "UpdateInstance";
  }

  getTrigger(
    command: Command.SubCommand<"UpdateInstance">
  ): Command.Trigger<"UpdateInstance"> {
    return async (currentAttributes, updatedAttributes) => {
      return this.submit(command, currentAttributes, updatedAttributes);
    };
  }

  private async submit(
    command: Command.SubCommand<"UpdateInstance">,
    currentAttributes: InstanceAttributeModel | null,
    updatedAttributes: FormAttributeResult[]
  ): Promise<
    Either.Type<
      Command.Error<"UpdateInstance">,
      Command.ApiData<"UpdateInstance">
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
