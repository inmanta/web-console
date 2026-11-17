import { Messages, registerMessages } from "@inmanta/web-console-core/I18n/Words";

/**
 * The test setup of this app (vitest.config.oss.ts), on top of the shared one in
 * `@inmanta/web-console-test-utils`. It holds what depends on the features this app ships.
 */

// Register the English messages of the layers and the features of this app, as the shell does
// when the app starts. A feature added to the app goes here too.
const messageModules = import.meta.glob<Record<string, Messages>>(
  [
    "/packages/{core,ui,shell}/src/**/messages.{ts,tsx}",
    "/packages/features/{environment,graphiql,orchestration-engine,resource-manager,user-management}/src/**/messages.{ts,tsx}",
  ],
  { eager: true }
);
Object.values(messageModules).forEach((module) => Object.values(module).forEach(registerMessages));
