import type * as WordsModule from "@/Core/I18n/Words";
import type * as AppFeaturesModule from "@/appFeatures";
import type * as RegisterAppMessagesModule from "./registerAppMessages";

const messageModules = import.meta.glob<Record<string, WordsModule.Messages>>(
  "/src/**/messages.{ts,tsx}",
  { eager: true }
);

it("registers the messages of every layer and feature the app ships", async () => {
  // The test setup registers every message, so start from a registry of our own.
  vi.resetModules();
  const { words } = await vi.importActual<typeof WordsModule>("@/Core/I18n/Words");
  const { features } = await vi.importActual<typeof AppFeaturesModule>("@/appFeatures");
  const { registerAppMessages } =
    await vi.importActual<typeof RegisterAppMessagesModule>("./registerAppMessages");

  registerAppMessages(features);

  const keys = Object.values(messageModules).flatMap((module) =>
    Object.values(module).flatMap(Object.keys)
  );

  expect(keys.length).toBeGreaterThan(0);
  keys.forEach((key) => expect(() => words(key as WordsModule.WordKey)).not.toThrow());
});
