import { KeyFactory } from "./KeyFactory";

describe("KeyFactory", () => {
  describe("constructor", () => {
    it("should initialize with sliceKey and optional queryKey", () => {
      const factory = new KeyFactory("testSlice", "testQuery");
      expect(factory).toBeInstanceOf(KeyFactory);
    });

    it("should initialize with only sliceKey", () => {
      const factory = new KeyFactory("testSlice");
      expect(factory).toBeInstanceOf(KeyFactory);
    });
  });

  describe("root", () => {
    it("should return array with sliceKey and queryKey when both are provided", () => {
      const factory = new KeyFactory("testSlice", "testQuery");
      expect(factory.root()).toEqual(["testSlice", "testQuery"]);
    });

    it("should return array with only sliceKey when queryKey is not provided", () => {
      const factory = new KeyFactory("testSlice");
      expect(factory.root()).toEqual(["testSlice"]);
    });
  });

  describe("slice", () => {
    it("should return array with only sliceKey", () => {
      const factory = new KeyFactory("testSlice", "testQuery");
      expect(factory.slice()).toEqual(["testSlice"]);
    });
  });

  describe("list", () => {
    it("should return array with root keys plus 'list' when no params provided", () => {
      const factory = new KeyFactory("testSlice", "testQuery");
      expect(factory.list()).toEqual(["testSlice", "testQuery", "list"]);
    });

    it("should return array with root keys plus 'list' and params when params provided", () => {
      const factory = new KeyFactory("testSlice", "testQuery");
      expect(factory.list(["param1", "param2"])).toEqual([
        "testSlice",
        "testQuery",
        "list",
        "param1",
        "param2",
      ]);
    });

    it("should work without queryKey", () => {
      const factory = new KeyFactory("testSlice");
      expect(factory.list(["param1"])).toEqual(["testSlice", "list", "param1"]);
    });
  });

  describe("single", () => {
    it("should return array with root keys plus 'single' and id when no params provided", () => {
      const factory = new KeyFactory("testSlice", "testQuery");
      expect(factory.single("123")).toEqual(["testSlice", "testQuery", "single", "123"]);
    });

    it("should return array with root keys plus 'single', id and params when params provided", () => {
      const factory = new KeyFactory("testSlice", "testQuery");
      expect(factory.single("123", ["param1", "param2"])).toEqual([
        "testSlice",
        "testQuery",
        "single",
        "123",
        "param1",
        "param2",
      ]);
    });

    it("should work without queryKey", () => {
      const factory = new KeyFactory("testSlice");
      expect(factory.single("123", ["param1"])).toEqual(["testSlice", "single", "123", "param1"]);
    });
  });
});
