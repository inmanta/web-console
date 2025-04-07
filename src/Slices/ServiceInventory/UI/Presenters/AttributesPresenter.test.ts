import { AttributesPresenter } from "./AttributesPresenter";

test("AttributesPresenter", () => {
  // Arrange
  const attributes = {
    a: "value",
    b: ["value", "value"],
    c: false,
    d: 123,
    e: null,
  };
  const string = JSON.stringify("value");
  const attributesPresenter = new AttributesPresenter();

  // Act
  const printed = attributesPresenter.getPairsSafe(attributes);

  // Assert
  expect(printed).toEqual([
    ["a", string],
    ["b", `${string}, ${string}`],
    ["c", "false"],
    ["d", "123"],
    ["e", "null"],
  ]);
});
