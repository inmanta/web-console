import type * as WordsModule from "./Words";

// The test setup registers every message. Each test loads its own copy of the registry instead.
const loadRegistry = async (): Promise<typeof WordsModule> => {
  vi.resetModules();

  return import("./Words");
};

describe("words", () => {
  it("returns the registered English message", async () => {
    const { registerMessages, words } = await loadRegistry();

    registerMessages({ "instanceComposer.editButton": "Edit in Composer" });

    expect(words("instanceComposer.editButton")).toBe("Edit in Composer");
  });

  it("throws for a key without a registered message", async () => {
    const { words } = await loadRegistry();

    expect(() => words("instanceComposer.editButton")).toThrow(
      'No message is registered for "instanceComposer.editButton".'
    );
  });

  it("returns the message of the active language, and English for the keys it lacks", async () => {
    const { registerMessages, registerLocale, setLocale, words } = await loadRegistry();

    registerMessages({
      "instanceComposer.editButton": "Edit in Composer",
      "instanceComposer.showButton": "Show in Composer",
    });
    registerLocale({
      locale: "nl",
      label: "Nederlands",
      messages: { "instanceComposer.editButton": "Bewerken in Composer" },
    });

    expect(words("instanceComposer.editButton")).toBe("Edit in Composer");

    setLocale("nl");

    expect(words("instanceComposer.editButton")).toBe("Bewerken in Composer");
    expect(words("instanceComposer.showButton")).toBe("Show in Composer");
  });
});
