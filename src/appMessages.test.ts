import { registerAppMessages } from "@/UI/Root/registerAppMessages";
import { features } from "@/appFeatures";
import * as WordsModule from "@inmanta/web-console-core/I18n/Words";

const messageModules = import.meta.glob<Record<string, WordsModule.Messages>>(
  ["/src/**/messages.{ts,tsx}", "/packages/**/messages.{ts,tsx}"],
  { eager: true }
);

const keys = Object.values(messageModules).flatMap((module) =>
  Object.values(module).flatMap(Object.keys)
);

it("registers the messages of every layer and feature the app ships", () => {
  // The test setup registers every message, so look at what the app itself registers.
  const registerMessages = vi.spyOn(WordsModule, "registerMessages");

  registerAppMessages(features);

  const registered = new Set(
    registerMessages.mock.calls.flatMap(([messages]) => Object.keys(messages))
  );

  expect(keys.length).toBeGreaterThan(0);
  expect(keys.filter((key) => !registered.has(key))).toEqual([]);
});

it("declares every key in one messages file only", () => {
  // A key in two files would silently overwrite the other message when both are registered.
  const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);

  expect(duplicates).toEqual([]);
});
