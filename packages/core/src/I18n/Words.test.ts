import type * as WordsModule from "./Words";

// The test setup registers every message. Each test loads its own copy of the registry instead.
const loadRegistry = async (): Promise<typeof WordsModule> => {
  vi.resetModules();

  return import("./Words");
};

describe("words", () => {
  it("returns the registered English message", async () => {
    const { registerMessages, words } = await loadRegistry();

    registerMessages({ "login.title": "Log in to your account" });

    expect(words("login.title")).toBe("Log in to your account");
  });

  it("logs an error and returns the key for a key without a registered message", async () => {
    const { words } = await loadRegistry();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(words("login.title")).toBe("login.title");
    expect(consoleError).toHaveBeenCalledWith('No message is registered for "login.title".');
  });

  it("returns the message of the active language, and English for the keys it lacks", async () => {
    const { registerMessages, registerLocale, setLocale, words } = await loadRegistry();

    registerMessages({
      "login.title": "Log in to your account",
      "login.fallback.local": "Sign in with a local account",
    });
    registerLocale({
      locale: "nl",
      label: "Nederlands",
      messages: { "login.title": "Meld je aan bij je account" },
    });

    expect(words("login.title")).toBe("Log in to your account");

    setLocale("nl");

    expect(words("login.title")).toBe("Meld je aan bij je account");
    expect(words("login.fallback.local")).toBe("Sign in with a local account");
  });
});
