import { times, cloneDeep } from "lodash-es";
import { FieldLikeWithFormState, InstanceAttributeModel } from "@/Core";

export const createFormState = (
  fields: FieldLikeWithFormState[]
): InstanceAttributeModel => {
  const returnValue = fields.reduce((acc, curr) => {
    switch (curr.kind) {
      case "Boolean":
      case "Enum":
      case "Text": {
        acc[curr.name] = curr.type.includes("dict")
          ? stringifyDict(curr.defaultValue)
          : curr.defaultValue;
        return acc;
      }

      case "InterServiceRelation": {
        acc[curr.name] = "";
        return acc;
      }

      case "Nested": {
        acc[curr.name] = createFormState(curr.fields);
        return acc;
      }

      case "RelationList": {
        if (curr.min <= 0) {
          acc[curr.name] = [];
        } else {
          acc[curr.name] = times(Number(curr.min), () => "");
        }
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
      default: {
        console.log("entering default reducer case and returning acc", acc);
        return acc;
      }
    }
  }, {});
  console.log("Reduced fields", returnValue);
  return returnValue;
};

export const createEditFormState = (
  fields: FieldLikeWithFormState[],
  originalAttributes?: InstanceAttributeModel | null
): InstanceAttributeModel => {
  return fields.reduce((acc, curr) => {
    if (originalAttributes?.[curr.name] !== undefined) {
      switch (curr.kind) {
        case "Boolean":
        case "Enum":
        case "Text": {
          acc[curr.name] = curr.type.includes("dict")
            ? stringifyDict(originalAttributes?.[curr.name])
            : cloneDeep(originalAttributes?.[curr.name]);
          return acc;
        }

        case "InterServiceRelation": {
          acc[curr.name] = originalAttributes?.[curr.name]
            ? originalAttributes?.[curr.name]
            : "";
          return acc;
        }

        case "Nested": {
          acc[curr.name] = createEditFormState(
            curr.fields,
            originalAttributes?.[curr.name] as InstanceAttributeModel
          );
          return acc;
        }

        case "RelationList": {
          acc[curr.name] = originalAttributes?.[curr.name] as string[];
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

function stringifyDict(value: unknown) {
  return value === "" ? "" : JSON.stringify(value);
}
