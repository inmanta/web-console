import { Command, Field, ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data";
import {
  AttributeResultConverter,
  sanitizeAttributes,
} from "@/Data/Common/AttributeConverter";

export class TriggerInstanceUpdateCommandManager extends CommandManagerWithEnv<"TriggerInstanceUpdate"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly attributeConverter: AttributeResultConverter
  ) {
    super(
      "TriggerInstanceUpdate",
      (command, environment) =>
        async (fields: Field[], currentAttributes, updatedAttributes) => {
          // Make sure correct types are used
          const parsedAttributes = sanitizeAttributes(
            fields,
            updatedAttributes
          );
          // Only the difference should be sent
          const attributeDiff = this.attributeConverter.calculateDiff(
            parsedAttributes,
            currentAttributes
          );
          return await this.apiHelper.patch(this.getUrl(command), environment, {
            attributes: attributeDiff,
          });
        }
    );
  }

  private getUrl({
    service_entity,
    id,
    version,
  }: Command.SubCommand<"TriggerInstanceUpdate">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`;
  }
}
