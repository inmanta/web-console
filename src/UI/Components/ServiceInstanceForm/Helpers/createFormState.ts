import { times, cloneDeep } from "lodash-es";
import { Field, InstanceAttributeModel } from "@/Core";

export const createFormState = (fields: Field[]): InstanceAttributeModel => {
  return fields.reduce((acc, curr) => {
    switch (curr.kind) {
      case "Boolean":
      case "Enum":
      case "Text": {
        acc[curr.name] = curr.type.includes("dict")
          ? JSON.stringify(curr.defaultValue)
          : curr.defaultValue;
        return acc;
      }

      case "Nested": {
        acc[curr.name] = createFormState(curr.fields);
        return acc;
      }

      case "DictList": {
        if (curr.min <= 0) {
          acc[curr.name] = [];
        } else {
          acc[curr.name] = times(Number(curr.min), () =>
            createFormState(curr.fields)
          );
        }

        return acc;
      }
    }
  }, {});
};

export const createEditFormState = (
  fields: Field[],
  originalAttributes?: InstanceAttributeModel | null
): InstanceAttributeModel => {
  return fields.reduce((acc, curr) => {
    if (originalAttributes?.[curr.name] !== undefined) {
      switch (curr.kind) {
        case "Boolean":
        case "Enum":
        case "Text": {
          acc[curr.name] = curr.type.includes("dict")
            ? JSON.stringify(originalAttributes?.[curr.name])
            : cloneDeep(originalAttributes?.[curr.name]);
          return acc;
        }
        case "Nested": {
          acc[curr.name] = createEditFormState(
            curr.fields,
            originalAttributes?.[curr.name] as InstanceAttributeModel
          );
          return acc;
        }
        case "DictList": {
          acc[curr.name] = (
            originalAttributes?.[curr.name] as InstanceAttributeModel[]
          ).map((nestedOriginalAttributes) =>
            createEditFormState(
              curr.fields,
              nestedOriginalAttributes as InstanceAttributeModel
            )
          );
          return acc;
        }
      }
    } else {
      const defaultFormStateForField = createFormState([curr]);
      acc[curr.name] = defaultFormStateForField[curr.name];
      return acc;
    }
  }, {});
};
