import * as WordsModule from "@/Core/I18n/Words";
import { features } from "@/appFeatures";
import { registerAppMessages } from "./registerAppMessages";

const messageModules = import.meta.glob<Record<string, WordsModule.Messages>>(
  "/src/**/messages.{ts,tsx}",
  { eager: true }
);

it("registers the messages of every layer and feature the app ships", () => {
  // The test setup registers every message, so look at what the app itself registers.
  const registerMessages = vi.spyOn(WordsModule, "registerMessages");

  registerAppMessages(features);

  const registered = new Set(
    registerMessages.mock.calls.flatMap(([messages]) => Object.keys(messages))
  );
  const keys = Object.values(messageModules).flatMap((module) =>
    Object.values(module).flatMap(Object.keys)
  );

  expect(keys.length).toBeGreaterThan(0);
  expect(keys.filter((key) => !registered.has(key))).toEqual([]);

  registerMessages.mockRestore();
});
