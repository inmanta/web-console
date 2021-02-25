import { ExpansionManager } from "./ExpansionManager";

test("ExpansionManager.create creates all keys with false", () => {
  // Arrange
  const manager = new ExpansionManager();

  // Act
  const state = manager.create(["a", "b"]);

  // Assert
  expect(state).toEqual({
    a: false,
    b: false,
  });
});

test("ExpansionManager.toggle toggles one key", () => {
  // Arrange
  const manager = new ExpansionManager();
  const state = manager.create(["a", "b"]);

  // Act
  const state2 = manager.toggle(state, "a");

  // Assert
  expect(state2).toEqual({ a: true, b: false });
});

test("ExpansionManager.merge adds new ids with false", () => {
  // Arrange
  const manager = new ExpansionManager();
  const state = manager.create(["a", "b"]);

  // Act
  const state2 = manager.merge(state, ["a", "b", "c"]);

  // Assert
  expect(state2).toEqual({ a: false, b: false, c: false });
});

test("ExpansionManager.merge clears removed ids", () => {
  // Arrange
  const manager = new ExpansionManager();
  const state = manager.create(["a", "b"]);

  // Act
  const state2 = manager.merge(state, ["a", "c"]);

  // Assert
  expect(state2).toEqual({ a: false, c: false });
});

test("ExpansionManager.merge keeps state of old ids", () => {
  // Arrange
  const manager = new ExpansionManager();
  const state = manager.create(["a", "b"]);

  // Act
  const state2 = manager.toggle(state, "a");
  const state3 = manager.merge(state2, ["a", "c"]);

  // Assert
  expect(state3).toEqual({ a: true, c: false });
});
