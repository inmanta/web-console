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
    definitionMap: EnvironmentSettings.DefinitionMap,
    values: EnvironmentSettings.ValuesMap
  ): EnvironmentSettings.InputInfo[] {
    return Object.values(definitionMap)
      .map((definition) =>
        this.definitionToInputInfo(
          definition,
          values[definition.name],
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
    definition: EnvironmentSettings.Definition,
    value: EnvironmentSettings.Value | undefined,
    setValue: (value: EnvironmentSettings.Value) => void
  ): EnvironmentSettings.InputInfo {
    const update = async (value) => {
      const error = await this.update(definition.name, value);
      this.setError(Maybe.withFallback(error, ""));
      return error;
    };

    switch (definition.type) {
      case "bool":
        return {
          ...definition,
          type: "bool",
          value: this.undefinedFallback(value, definition.default),
          set: (value) => setValue(value),
          update,
          reset: () => this.reset(definition.name),
        };
      case "int":
        return {
          ...definition,
          type: "int",
          value: this.undefinedFallback(value, definition.default),
          set: (value) => setValue(value),
          update,
          reset: () => this.reset(definition.name),
        };
      case "enum":
        return {
          ...definition,
          type: "enum",
          value: this.undefinedFallback(value, definition.default),
          set: (value) => setValue(value),
          update,
          reset: () => this.reset(definition.name),
        };
      case "dict":
        return {
          ...definition,
          type: "dict",
          value: this.undefinedFallback(
            value,
            definition.default as EnvironmentSettings.Dict
          ),
          set: (value) => setValue(value),
          update,
          reset: () => this.reset(definition.name),
        };
    }
  }

  private undefinedFallback<V>(value: unknown | undefined, fallback: V): V {
    return typeof value === "undefined" ? fallback : (value as V);
  }
}
