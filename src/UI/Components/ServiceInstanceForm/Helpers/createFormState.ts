import { times, cloneDeep } from "lodash-es";
import { FieldLikeWithFormState, InstanceAttributeModel } from "@/Core";

/**
 * Create an form state based on the provided fields.
 *
 * @param {FieldLikeWithFormState[]} fields - Array of fields with form state information.
 * @returns {InstanceAttributeModel} The instance attribute Model.
 */
export const createFormState = (
  fields: FieldLikeWithFormState[],
): InstanceAttributeModel => {
  const returnValue = fields.reduce((acc, curr) => {
    switch (curr.kind) {
      case "Boolean":
      case "Enum":
      case "Text":
      case "Textarea":
      case "TextList": {
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
            createFormState(curr.fields),
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
 * Create an edit form state based on the provided fields, API version, and original attributes.
 * If API version is "v2" and original attributes are provided, returns the original attributes as the edit form state.
 * Otherwise, generates an edit form state by comparing the provided fields with the original attributes.
 *
 * @param {FieldLikeWithFormState[]} fields - Array of fields with form state information.
 * @param {"v1" | "v2"} apiVersion - API version ("v1" or "v2").
 * @param {InstanceAttributeModel | null | undefined} originalAttributes - Original attributes of the instance.
 * @returns {InstanceAttributeModel} The edit form state.
 */
export const createEditFormState = (
  fields: FieldLikeWithFormState[],
  apiVersion: "v1" | "v2",
  originalAttributes?: InstanceAttributeModel | null,
): InstanceAttributeModel => {
  if (apiVersion === "v2" && originalAttributes) {
    return originalAttributes;
  }

  return fields.reduce((acc, curr) => {
    if (originalAttributes?.[curr.name] !== undefined) {
      switch (curr.kind) {
        case "Boolean":
        case "Enum":
        case "Textarea":
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
              originalAttributes?.[curr.name] as InstanceAttributeModel,
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
              nestedOriginalAttributes as InstanceAttributeModel,
            ),
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

/**
 * Create a form state for duplicating an instance based on the provided fields and original attributes.
 * If an original attribute is present, generates a duplicate form state by copying the values from the original instance.
 * Otherwise, generates a default form state based on the provided fields.
 *
 * @param {FieldLikeWithFormState[]} fields - Array of fields with form state information.
 * @param {InstanceAttributeModel | null | undefined} originalAttributes - Original attributes of the instance.
 * @returns {InstanceAttributeModel} The duplicate form state.
 */
export const createDuplicateFormState = (
  fields: FieldLikeWithFormState[],
  originalAttributes?: InstanceAttributeModel | null,
): InstanceAttributeModel => {
  return fields.reduce((acc, curr) => {
    if (originalAttributes?.[curr.name] !== undefined) {
      switch (curr.kind) {
        case "Boolean":
        case "Enum":
        case "Textarea":
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
            acc[curr.name] = createDuplicateFormState(
              curr.fields,
              originalAttributes?.[curr.name] as InstanceAttributeModel,
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
            createDuplicateFormState(
              curr.fields,
              nestedOriginalAttributes as InstanceAttributeModel,
            ),
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

/**
 * Convert a value to a JSON string, or return an empty string if the value is an empty string.
 *
 * @param {unknown} value - The value to stringify.
 * @returns {string} The JSON string representation of the value, or an empty string if the value is an empty string.
 */
function stringifyDict(value: unknown) {
  return value === "" ? "" : JSON.stringify(value);
}
