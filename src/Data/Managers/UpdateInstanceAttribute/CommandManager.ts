import { ApiHelper, AuthHelper, ParsedNumber } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function UpdateInstanceAttributeCommandManager(
  authHelper: AuthHelper,
  apiHelper: ApiHelper,
) {
  return CommandManagerWithEnv<"UpdateInstanceAttribute">(
    "UpdateInstanceAttribute",
    ({ service_entity, id, version }, environment) =>
      (attribute_set_name, value, target) =>
        apiHelper.patch(
          `/lsm/v2/service_inventory/${service_entity}/${id}/expert`,
          environment,
          composeCommandBody(
            authHelper.getUsername(),
            attribute_set_name,
            value,
            target,
            version,
            service_entity,
            id,
          ),
        ),
  );
}

export const composeCommandBody = (
  username: string | null,
  attribute_set_name: attributeSet,
  value: string | number | boolean | string[],
  target: string,
  version: ParsedNumber,
  service_entity: string,
  id: string,
): UpdateInstanceBody => {
  const comment = username
    ? `Triggered from the console by ${username}`
    : "Triggered from the console";
  return {
    patch_id: service_entity + "-update-" + id + "-" + version,
    attribute_set_name,
    edit: [
      {
        edit_id:
          service_entity + "-" + target + "-update-" + id + "-" + version,
        operation: "replace",
        target,
        value,
      },
    ],
    current_version: version,
    comment,
  };
};

interface UpdateInstanceBody {
  patch_id: string;
  attribute_set_name: attributeSet;
  edit: [
    {
      edit_id: string;
      operation: "merge" | "replace" | "remove";
      target: string;
      value: string | number | boolean | string[];
    },
  ];
  current_version: ParsedNumber;
  comment: string;
}

export type attributeSet =
  | "candidate_attributes"
  | "active_attributes"
  | "rollback_attributes";
