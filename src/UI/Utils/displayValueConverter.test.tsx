import { convertToTitleCase } from "./displayValueConverter";

const testValues = {
  snake_case: "some_case_text",
  hyphen_case: "some-case-text",
  mixed_case: "some_case-text",
  mixed_upper_case: "SOME-CASE_TEXT",
  start_with_underscore: "_some_case_text",
  end_with_underscore: "some_case_text_",
  start_with_hyphen: "-some-case-text",
  end_with_hyphen: "some-case-text-",
  double_hyphen: "some--case-text",
  double_underscore: "some__case_text",
  normal_string: "some case text",
};

const titleCasedResult = "Some Case Text";

test("Should convert snake case to Title Cased text", () => {
  expect(convertToTitleCase(testValues.snake_case)).toBe(titleCasedResult);
});
test("Should convert hyphen-case to title cased text", () => {
  expect(convertToTitleCase(testValues.hyphen_case)).toBe(titleCasedResult);
});
test("Should convert mixed-cased to title cased text", () => {
  expect(convertToTitleCase(testValues.mixed_case)).toBe(titleCasedResult);
});
test("Should convert mixed upper-cased to title cased text", () => {
  expect(convertToTitleCase(testValues.mixed_upper_case)).toBe(
    titleCasedResult,
  );
});
test("Should convert a snake cased string starting with an underscore to title cased text", () => {
  expect(convertToTitleCase(testValues.start_with_underscore)).toBe(
    titleCasedResult,
  );
});
test("Should convert a snake cased string ending with an underscore to title cased text", () => {
  expect(convertToTitleCase(testValues.end_with_underscore)).toBe(
    titleCasedResult,
  );
});
test("Should convert a hyphen cased string starting with a hyphen to title cased text", () => {
  expect(convertToTitleCase(testValues.start_with_hyphen)).toBe(
    titleCasedResult,
  );
});
test("Should convert a hyphen cased string ending with a hyphen to title cased text", () => {
  expect(convertToTitleCase(testValues.end_with_hyphen)).toBe(titleCasedResult);
});
test("Should convert a snake cased string with double underscore to title cased text", () => {
  expect(convertToTitleCase(testValues.double_underscore)).toBe(
    titleCasedResult,
  );
});
test("Should convert a hyphen cased string with double hyphen to title cased text", () => {
  expect(convertToTitleCase(testValues.double_hyphen)).toBe(titleCasedResult);
});
test("Should title case a string that already has white spaces", () => {
  expect(convertToTitleCase(testValues.normal_string)).toBe(titleCasedResult);
});
test("It should not break when being passed numerical characters", () => {
  expect(convertToTitleCase("300")).toBe("300");
});
test("It should not break when being passed other characters", () => {
  expect(convertToTitleCase("@work!")).toBe("@work!");
});
