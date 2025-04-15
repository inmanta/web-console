import { urlEncodeParams } from "./utils";

describe("urlEncodeParams", () => {
  it("should encode string values in the object", () => {
    const params = { name: "John Doe", city: "New York" };
    const result = urlEncodeParams(params);
    expect(result).toEqual({ name: "John%20Doe", city: "New%20York" });
  });

  it("should not encode non-string values in the object", () => {
    const params = { age: 30, isAdmin: true };
    const result = urlEncodeParams(params);
    expect(result).toEqual({ age: 30, isAdmin: true });
  });

  it("should handle an empty object", () => {
    const params = {};
    const result = urlEncodeParams(params);
    expect(result).toEqual({});
  });

  it("should handle mixed types in the object", () => {
    const params = { name: "Alice", age: 25, city: "Los Angeles" };
    const result = urlEncodeParams(params);
    expect(result).toEqual({ name: "Alice", age: 25, city: "Los%20Angeles" });
  });

  it("should handle special characters in string values", () => {
    const params = { query: "a+b=c&d=e" };
    const result = urlEncodeParams(params);
    expect(result).toEqual({ query: "a%2Bb%3Dc%26d%3De" });
  });

  it("should encode ':' and '/' in string values", () => {
    const params = { path: "folder/subfolder:file" };
    const result = urlEncodeParams(params);
    expect(result).toEqual({ path: "folder%2Fsubfolder%3Afile" });
  });
});
