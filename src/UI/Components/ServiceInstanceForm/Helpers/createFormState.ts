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
        if (curr.isOptional) {
          acc[curr.name] = null;
        } else {
          acc[curr.name] = createFormState(curr.fields);
        }
        return acc;
      }

      case "RelationList": {
        acc[curr.name] = [];
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
        return acc;
      }
    }
  }, {});

  return returnValue;
};

/**
 * Creates Form State based on available fields and optional originalAttributes.
 * If apiVersion "v2" then returns originalAttributes as second version endpoint replaces the whole edited instance
 * and fields not necessarily cover that 1:1
 *
 * @param {FieldLikeWithFormState[]} fields - active fields that
 * @param {"v1" | "v2"} apiVersion - version of endpoint which handles the edit
 * @param {InstanceAttributeModel | null | undefined} originalAttributes - current state of Attributes
 * @returns
 */
export const createEditFormState = (
  fields: FieldLikeWithFormState[],
  apiVersion: "v1" | "v2",
  originalAttributes?: InstanceAttributeModel | null
): InstanceAttributeModel => {
  if (apiVersion === "v2" && originalAttributes) {
    return originalAttributes;
  }
  return fields.reduce((acc, curr) => {
    if (originalAttributes?.[curr.name] !== undefined) {
      switch (curr.kind) {
        case "Boolean":
        case "Enum":
        case "TextList":
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
          if (curr.isOptional && originalAttributes?.[curr.name] === null) {
            acc[curr.name] = null;
          } else {
            acc[curr.name] = createEditFormState(
              curr.fields,
              apiVersion,
              originalAttributes?.[curr.name] as InstanceAttributeModel
            );
          }
          return acc;
        }

        case "RelationList": {
          acc[curr.name] = (originalAttributes?.[curr.name] as string[]) || [];
          return acc;
        }

        case "DictList": {
          acc[curr.name] = (
            originalAttributes?.[curr.name] as InstanceAttributeModel[]
          ).map((nestedOriginalAttributes) =>
            createEditFormState(
              curr.fields,
              apiVersion,
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
