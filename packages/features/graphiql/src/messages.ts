// Loads the words of the shared components into WordsRegistry: this package uses them, and with
// project references a package only sees the declaration merging of the files it imports.
import type {} from "@inmanta/web-console-ui/messages";

/**
 * The English messages of the GraphiQL page.
 */
export const graphiqlMessages = {
  /**
   * Dashboard
   */
  "graphiql.title": "GraphiQL",
};

type GraphiqlMessages = typeof graphiqlMessages;

declare module "@inmanta/web-console-core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends GraphiqlMessages {}
}
