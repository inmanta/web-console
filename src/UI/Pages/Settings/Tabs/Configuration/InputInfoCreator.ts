import { EnvironmentSettings, Maybe } from "@/Core";

type Update = (
  id: string,
  value: EnvironmentSettings.Value
) => Promise<Maybe.Type<string>>;

type Reset = (id: string) => Promise<Maybe.Type<string>>;

export class InputInfoCreator {
  constructor(
    private readonly setValues: (values: EnvironmentSettings.ValuesMap) => void,
    private readonly update: Update,
    private readonly reset: Reset,
    private readonly setError: (message: string) => void
  ) {}

  create(
    settingsMap: EnvironmentSettings.ValuesMap,
    definitionMap: EnvironmentSettings.DefinitionMap,
    values: EnvironmentSettings.ValuesMap
  ): EnvironmentSettings.InputInfo[] {
    return Object.values(definitionMap)
      .map((definition) =>
        this.definitionToInputInfo(
          settingsMap[definition.name],
          values[definition.name],
          definition,
          (value) => this.setValues({ ...values, [definition.name]: value })
        )
      )
      .sort(this.compare);
  }

  private compare(
    a: EnvironmentSettings.InputInfo,
    b: EnvironmentSettings.InputInfo
  ): number {
    return a.name < b.name ? -1 : 1;
  }

  private definitionToInputInfo(
    initial: EnvironmentSettings.Value,
    value: EnvironmentSettings.Value | undefined,
    definition: EnvironmentSettings.Definition,
    setValue: (value: EnvironmentSettings.Value) => void
  ): EnvironmentSettings.InputInfo {
    const update = async (value: EnvironmentSettings.Value) => {
      const error = await this.update(definition.name, value);
      this.setError(Maybe.withFallback(error, ""));
      return error;
    };

    const reset = async () => {
      if (initial === definition.default && value !== definition.default) {
        setValue(definition.default);
        return Maybe.none();
      } else {
        const error = await this.reset(definition.name);
        this.setError(Maybe.withFallback(error, ""));
        return error;
      }
    };

    const isUpdateable: EnvironmentSettings.IsUpdateable = (info) => {
      if (info.initial === undefined && info.value === info.default) {
        return false;
      }
      return info.value !== info.initial;
    };

    switch (definition.type) {
      case "bool":
        return {
          ...definition,
          type: "bool",
          initial: initial as boolean,
          value: this.undefinedFallback(value, definition.default),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
      case "int":
        return {
          ...definition,
          type: "int",
          initial: initial as number,
          value: this.undefinedFallback(value, definition.default),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
      case "enum":
        return {
          ...definition,
          type: "enum",
          initial: initial as string,
          value: this.undefinedFallback(value, definition.default),
          set: (value) => setValue(value),
          update,
          reset,
          isUpdateable,
        };
      case "dict":
        return {
          ...definition,
          type: "dict",
          initial: initial as EnvironmentSettings.Dict,
          value: this.undefinedFallback(
            value,
            definition.default as EnvironmentSettings.Dict
          ),
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
