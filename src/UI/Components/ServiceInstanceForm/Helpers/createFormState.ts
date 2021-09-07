import { times, cloneDeep } from "lodash";
import { Field, InstanceAttributeModel } from "@/Core";

export const createFormState = (
  fields: Field[],
  originalAttributes?: InstanceAttributeModel | null
): InstanceAttributeModel => {
  return fields.reduce((acc, curr) => {
    switch (curr.kind) {
      case "Flat": {
        if (originalAttributes?.[curr.name] !== undefined) {
          acc[curr.name] = curr.type.includes("dict")
            ? JSON.stringify(originalAttributes?.[curr.name])
            : cloneDeep(originalAttributes?.[curr.name]);
        } else {
          acc[curr.name] = curr.defaultValue;
        }
        return acc;
      }

      case "Nested": {
        acc[curr.name] = createFormState(
          curr.fields,
          originalAttributes?.[curr.name] as InstanceAttributeModel
        );
        return acc;
      }

      case "DictList": {
        if (
          originalAttributes?.[curr.name] !== undefined &&
          Object.keys(originalAttributes?.[curr.name] as InstanceAttributeModel)
            .length > 0
        ) {
          acc[curr.name] = (
            originalAttributes?.[curr.name] as InstanceAttributeModel[]
          ).map((nestedOriginalAttributes) =>
            createFormState(
              curr.fields,
              nestedOriginalAttributes as InstanceAttributeModel
            )
          );
        } else {
          if (curr.min <= 0) {
            acc[curr.name] = [];
          } else {
            acc[curr.name] = times(curr.min, () =>
              createFormState(curr.fields)
            );
          }
        }

        return acc;
      }
    }
  }, {});
};
