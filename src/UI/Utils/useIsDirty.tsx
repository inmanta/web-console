import { useEffect, useState } from "react";
import { InstanceAttributeModel } from "@/Core";

/**
 * Continously check if any properties in given object are modified comparing to baseToCompare param or populated with any non-default data(empty string or null)
 * return boolean value depending on the outcome and function to override Hooks State manually
 *
 * @param  object
 * @param baseToCompare
 *
 */
export default function useIsDirty(
  object,
  baseToCompare: InstanceAttributeModel | undefined = undefined
) {
  const [isDirty, setIsDirty] = useState(false);
  const overrideState = (value: boolean) => {
    setIsDirty(value);
  };
  useEffect(() => {
    function convertToFlatObject(object, parentKey = "") {
      if (Object.keys(object).length === 0) {
        return {};
      }
      let result = {};

      for (const key in object) {
        if (
          object[key] !== null &&
          typeof object[key] === "object" &&
          !Array.isArray(object[key])
        ) {
          const temp = convertToFlatObject(object[key]);
          for (const tempKey in temp) {
            if (parentKey !== "") {
              result[parentKey + "." + key + "." + tempKey] = temp[tempKey];
            } else {
              result[key + "." + tempKey] = temp[tempKey];
            }
          }
        } else if (
          typeof object[key] === "object" &&
          Array.isArray(object[key])
        ) {
          const mergedObjects = Object.assign(
            object[key].map((objectInArray, index) =>
              convertToFlatObject(objectInArray, index)
            )
          );
          for (const tempkey in mergedObjects) {
            result = { ...result, ...mergedObjects[tempkey] };
          }
        } else {
          if (parentKey !== "") {
            result[parentKey + "." + key] = object[key];
          } else {
            result[key] = object[key];
          }
        }
      }
      return result;
    }
    if (!baseToCompare) {
      setIsDirty(
        Object.values(convertToFlatObject(object)).some(
          (value) => value !== "" && value !== null
        )
      );
    } else {
      setIsDirty(
        compareObjects(
          convertToFlatObject(object),
          convertToFlatObject(baseToCompare)
        )
      );
    }
  }, [object, baseToCompare]);

  return { isDirty, overrideState };
}

/**
 * This helper is extracting only properties that are in modifiedObject(flatObj)
 * due to the fact that EditForm component can't modify all of the properties from original Instance(baseToCompare)
 * and returns boolean value of comparion of stringified objects
 *
 * @param flatObj
 * @param flatBaseToCompare
 *
 */
const compareObjects = (flatObj, flatBaseToCompare) => {
  const truncatedBaseToCompare = {};
  Object.keys(flatObj).forEach((key) => {
    if (flatBaseToCompare[key] !== undefined) {
      truncatedBaseToCompare[key] = flatBaseToCompare[key];
    }
  });
  return JSON.stringify(flatObj) !== JSON.stringify(truncatedBaseToCompare);
};
