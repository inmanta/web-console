import _ from "lodash";
import { EnvironmentSettings } from "@/Core";
import { InputInfoCreator } from "./InputInfoCreator";

describe("InputInfoCreator", () => {
  let mockSetValues: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockReset: ReturnType<typeof vi.fn>;
  let inputInfoCreator: InputInfoCreator;

  // Helper function to create common definition structure
  const createDefinition = (
    name: string,
    type: string,
    defaultValue: EnvironmentSettings.Value | EnvironmentSettings.Dict,
    section = "test"
  ): EnvironmentSettings.Definition =>
    ({
      name,
      type,
      default: defaultValue,
      doc: `${name} setting`,
      recompile: false,
      update_model: false,
      agent_restart: false,
      section,
    }) as EnvironmentSettings.Definition;

  beforeEach(() => {
    mockSetValues = vi.fn();
    mockUpdate = vi.fn();
    mockReset = vi.fn();
    inputInfoCreator = new InputInfoCreator(mockSetValues, mockUpdate, mockReset);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should group input infos by section", () => {
      const definitionMap = {
        auto_deploy: createDefinition("auto_deploy", "bool", false, "deployment"),
        server_compile: createDefinition("server_compile", "bool", true, "compilation"),
      };
      const settingsMap = { auto_deploy: true, server_compile: false };
      const values = { auto_deploy: false, server_compile: true };

      const result = inputInfoCreator.create(settingsMap, definitionMap, values);

      expect(result).toHaveProperty("deployment");
      expect(result).toHaveProperty("compilation");
      expect(result.deployment).toHaveLength(1);
      expect(result.compilation).toHaveLength(1);
      expect(result.deployment[0].name).toBe("auto_deploy");
      expect(result.compilation[0].name).toBe("server_compile");
    });

    it("should sort sections alphabetically", () => {
      const definitionMap = {
        setting1: createDefinition("setting1", "bool", false, "zebra"),
        setting2: createDefinition("setting2", "str", "", "alpha"),
        setting3: createDefinition("setting3", "int", 0, "beta"),
      };
      const settingsMap = { setting1: true, setting2: "test", setting3: 42 };
      const values = { setting1: false, setting2: "new", setting3: 24 };

      const result = inputInfoCreator.create(settingsMap, definitionMap, values);
      const sectionKeys = Object.keys(result);

      expect(sectionKeys).toEqual(["alpha", "beta", "zebra"]);
      expect(result.alpha).toHaveLength(1);
      expect(result.beta).toHaveLength(1);
      expect(result.zebra).toHaveLength(1);
    });

    it("should handle empty definition map", () => {
      const result = inputInfoCreator.create({}, {}, {});
      expect(result).toEqual({});
    });
  });

  describe("definitionToInputInfo", () => {
    // Helper to test input info creation with different types
    const testInputInfoCreation = (
      type: string,
      defaultValue: EnvironmentSettings.Value | EnvironmentSettings.Dict,
      initialValue: EnvironmentSettings.Value | EnvironmentSettings.Dict,
      currentValue: EnvironmentSettings.Value | EnvironmentSettings.Dict,
      additionalProps: Partial<EnvironmentSettings.Definition> = {}
    ) => {
      const definition = {
        ...createDefinition("test_setting", type, defaultValue),
        ...additionalProps,
      };
      const settingsMap = { test_setting: initialValue };
      const values = { test_setting: currentValue };

      const result = inputInfoCreator.create(settingsMap, { test_setting: definition }, values);
      const inputInfo = result.test[0];

      expect(inputInfo.type).toBe(type === "unknown_type" ? "str" : type);
      expect(inputInfo.initial).toBe(initialValue);
      expect(inputInfo.value).toBe(currentValue);
      expect(inputInfo.default).toEqual(defaultValue);
      expect(typeof inputInfo.set).toBe("function");
      expect(typeof inputInfo.update).toBe("function");
      expect(typeof inputInfo.reset).toBe("function");
      expect(typeof inputInfo.isUpdateable).toBe("function");

      return inputInfo;
    };

    it("should create boolean input info correctly", () => {
      testInputInfoCreation("bool", false, true, false);
    });

    it("should handle undefined value with default fallback", () => {
      const definition = createDefinition("test_setting", "bool", true);
      const result = inputInfoCreator.create(
        { test_setting: false },
        { test_setting: definition },
        {}
      );
      expect(result.test[0].value).toBe(true);
    });

    it("should create integer input info correctly", () => {
      testInputInfoCreation("int", 600, 300, 450);
    });

    it("should create positive float input info correctly", () => {
      testInputInfoCreation("positive_float", 0.5, 1.0, 0.75);
    });

    it("should create enum input info correctly", () => {
      const inputInfo = testInputInfoCreation(
        "enum",
        "push_full_deploy",
        "push_incremental_deploy",
        "push_full_deploy",
        { allowed_values: ["push_full_deploy", "push_incremental_deploy"] }
      ) as EnvironmentSettings.EnumInputInfo;
      expect(inputInfo.allowed_values).toEqual(["push_full_deploy", "push_incremental_deploy"]);
    });

    it("should create dict input info correctly", () => {
      const defaultDict = { internal: "local:" };
      const initialDict = { internal: "local:", external: "remote:" };
      const currentDict = { internal: "local:" };

      testInputInfoCreation("dict", defaultDict, initialDict, currentDict);
    });

    it("should create string input info correctly", () => {
      testInputInfoCreation("str", "", "0 2 * * *", "0 3 * * *");
    });

    it("should create string input info for unknown types", () => {
      testInputInfoCreation("unknown_type", "default_value", "initial_value", "current_value");
    });
  });

  describe("input info handlers", () => {
    let inputInfo: EnvironmentSettings.BooleanInputInfo;

    beforeEach(() => {
      const definition = createDefinition("auto_deploy", "bool", false, "deployment");
      const result = inputInfoCreator.create(
        { auto_deploy: true },
        { auto_deploy: definition },
        { auto_deploy: false }
      );
      inputInfo = result.deployment[0] as EnvironmentSettings.BooleanInputInfo;
    });

    it("should handle set, update, and reset operations", async () => {
      // Test set handler
      inputInfo.set(true);
      expect(mockSetValues).toHaveBeenCalledWith({ auto_deploy: true });

      // Test update handler
      await inputInfo.update(true);
      expect(mockUpdate).toHaveBeenCalledWith("auto_deploy", true);

      // Test reset when initial !== default
      inputInfo.reset();
      expect(mockReset).toHaveBeenCalledWith("auto_deploy");
    });

    it("should call setValue with default when initial equals default", () => {
      const definition = createDefinition("test_setting", "bool", false);
      const result = inputInfoCreator.create(
        { test_setting: false }, // initial === default
        { test_setting: definition },
        { test_setting: true } // value !== default
      );
      const resetInputInfo = result.test[0] as EnvironmentSettings.BooleanInputInfo;

      resetInputInfo.reset();
      expect(mockSetValues).toHaveBeenCalledWith({ test_setting: false });
    });

    it("should determine updateability based on value-initial comparison", () => {
      expect(inputInfo.isUpdateable({ initial: true, value: false, default: false })).toBe(true);
      expect(inputInfo.isUpdateable({ initial: true, value: true, default: false })).toBe(false);

      // Complex object comparison
      const initial = { a: 1, b: 2 };
      expect(inputInfo.isUpdateable({ initial, value: { a: 1, b: 2 }, default: {} })).toBe(false);
      expect(inputInfo.isUpdateable({ initial, value: { a: 1, b: 3 }, default: {} })).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle multiple definitions in the same section", () => {
      const definitionMap = {
        setting1: createDefinition("setting1", "bool", false),
        setting2: createDefinition("setting2", "str", ""),
      };
      const settingsMap = { setting1: true, setting2: "test" };
      const values = { setting1: false, setting2: "new" };

      const result = inputInfoCreator.create(settingsMap, definitionMap, values);
      expect(result.test).toHaveLength(2);
    });

    it("should handle missing values gracefully", () => {
      const definition = createDefinition("auto_deploy", "bool", false, "deployment");
      const result = inputInfoCreator.create({}, { auto_deploy: definition }, {});
      const inputInfo = result.deployment[0] as EnvironmentSettings.BooleanInputInfo;

      expect(inputInfo.initial).toBeUndefined();
      expect(inputInfo.value).toBe(false); // Should use default
    });
  });
});
