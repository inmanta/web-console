import _ from "lodash";
import { EnvironmentSettings } from "@/Core";
import {
  BooleanDefinition,
  DictDefinition,
  EnumDefinition,
  IntDefinition,
  PositiveFloatDefinition,
  StrDefinition,
  UnknownDefinition,
} from "@/Core/Domain/EnvironmentSettings";

type Update = (id: string, value: EnvironmentSettings.Value) => void;

type Reset = (id: string) => void;

/**
 * InputInfoCreator class
 *
 * @param setValues - The function to set the values
 * @param update - The function to update the values
 * @param reset - The function to reset the values
 */
export class InputInfoCreator {
  constructor(
    private readonly setValues: (values: EnvironmentSettings.ValuesMap) => void,
    private readonly update: Update,
    private readonly reset: Reset
  ) {}

  create(
    settingsMap: EnvironmentSettings.ValuesMap,
    definitionMap: EnvironmentSettings.DefinitionMap,
    values: EnvironmentSettings.ValuesMap
  ): EnvironmentSettings.SectionnedInputInfo {
    const inputInfos = Object.values(definitionMap)
      .map((definition) =>
        this.definitionToInputInfo(
          settingsMap[definition.name],
          values[definition.name],
          definition,
          (value) => this.setValues({ ...values, [definition.name]: value })
        )
      )
      .sort(this.compare);

    const groupedBySection = _.groupBy(inputInfos, "section");

    // Return an object with sections sorted alphabetically
    return Object.keys(groupedBySection)
      .sort()
      .reduce((sortedSections, sectionName) => {
        sortedSections[sectionName] = groupedBySection[sectionName];
        return sortedSections;
      }, {} as EnvironmentSettings.SectionnedInputInfo);
  }

  private compare(a: EnvironmentSettings.InputInfo, b: EnvironmentSettings.InputInfo): number {
    return a.name < b.name ? -1 : 1;
  }

  private definitionToInputInfo(
    initial: EnvironmentSettings.Value,
    value: EnvironmentSettings.Value | undefined,
    definition: EnvironmentSettings.Definition,
    setValue: (value: EnvironmentSettings.Value) => void
  ): EnvironmentSettings.InputInfo {
    const update = async (value: EnvironmentSettings.Value) => {
      this.update(definition.name, value);
    };

    const reset = () => {
      if (initial === definition.default && value !== definition.default) {
        setValue(definition.default);
      } else {
        this.reset(definition.name);
      }
    };

    const isUpdateable: EnvironmentSettings.IsUpdateable = (info) => {
      if (info.initial === undefined && info.value === info.default) {
        return false;
      }

      return !_.isEqual(info.value, info.initial);
    };

    switch (definition.type) {
      case "bool":
        const BooleanDefinition = definition as BooleanDefinition;

        return {
          ...BooleanDefinition,
          type: "bool",
          initial: initial as boolean,
          value: this.undefinedFallback(value, BooleanDefinition.default),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
      case "int":
        const intDefinition = definition as IntDefinition;

        return {
          ...intDefinition,
          type: "int",
          initial: initial as number,
          value: this.undefinedFallback(value, intDefinition.default),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
      case "positive_float":
        const positiveFloatDefinition = definition as PositiveFloatDefinition;

        return {
          ...positiveFloatDefinition,
          type: "positive_float",
          initial: initial as number,
          value: this.undefinedFallback(value, positiveFloatDefinition.default),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
      case "enum":
        const enumerationDefinition = definition as EnumDefinition;

        return {
          ...enumerationDefinition,
          type: "enum",
          initial: initial as string,
          value: this.undefinedFallback(value, enumerationDefinition.default),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
      case "dict":
        const dictDefinition = definition as DictDefinition;

        return {
          ...dictDefinition,
          type: "dict",
          initial: initial as EnvironmentSettings.Dict,
          value: this.undefinedFallback(value, dictDefinition.default as EnvironmentSettings.Dict),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
      case "str":
        const strDefinition = definition as StrDefinition;

        return {
          ...strDefinition,
          type: "str",
          initial: initial as string,
          value: this.undefinedFallback(value, strDefinition.default),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
      default:
        const unknown = definition as UnknownDefinition;

        return {
          ...unknown,
          type: "str",
          initial: initial as string,
          value: this.undefinedFallback(value, unknown.default),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
    }
  }

  private undefinedFallback<V>(value: unknown | undefined, fallback: V): V {
    return typeof value === "undefined" ? fallback : (value as V);
  }
}
