import { Messages, registerMessages } from "@inmanta/web-console-core/I18n/Words";

/**
 * The test setup of this app, on top of the shared one in `@inmanta/web-console-test-utils`. It
 * holds what depends on the features this app ships and where they live.
 */

// Register the English messages of every layer and feature, as the shell does when the app starts.
const messageModules = import.meta.glob<Record<string, Messages>>(
  ["/src/**/messages.{ts,tsx}", "/packages/**/messages.{ts,tsx}"],
  { eager: true }
);
Object.values(messageModules).forEach((module) => Object.values(module).forEach(registerMessages));
