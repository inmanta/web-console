import { times } from "lodash";
import { Field, InstanceAttributeModel } from "@/Core";

export const createFormState = (fields: Field[]): InstanceAttributeModel => {
  return fields.reduce((acc, curr) => {
    switch (curr.kind) {
      case "Flat": {
        acc[curr.name] = curr.defaultValue;
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
          acc[curr.name] = times(curr.min, () => createFormState(curr.fields));
        }

        return acc;
      }
    }
  }, {});
};
