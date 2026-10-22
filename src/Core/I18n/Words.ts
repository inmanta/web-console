import { ReactNode } from "react";

/**
 * A message: a string, or a function that builds one from its arguments. A function may return
 * markup, e.g. to show a name in bold.
 */
export type Message = string | ((...args: never[]) => ReactNode);

/**
 * Messages by key. Keys are namespaced with dots, e.g. "instanceComposer.editButton".
 */
export type Messages = Record<string, Message>;

/**
 * The open registry of messages: maps every key to the type of its English message. It is empty
 * here. The core layer, the shared components, the shell and every feature add their keys through
 * declaration merging, next to their messages:
 *
 * ```ts
 * export const lsmMessages = { ... };
 *
 * type LsmMessages = typeof lsmMessages;
 *
 * declare module "@/Core/I18n/Words" {
 *   // eslint-disable-next-line @typescript-eslint/no-empty-object-type
 *   interface WordsRegistry extends LsmMessages {}
 * }
 * ```
 *
 * The messages objects don't use `satisfies Messages`: it would type the parameters of a message
 * without a type annotation as `never`. They are checked against `Messages` where they are
 * registered instead.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WordsRegistry {}

export type WordKey = keyof WordsRegistry;

/**
 * The messages of one language, for any number of features, keyed by the same keys as English.
 * A message that is missing falls back to English, so a partial translation never shows a raw key.
 */
export interface LocaleModule {
  /**
   * BCP 47 language tag, e.g. "fr" or "nl-BE".
   */
  locale: string;

  /**
   * The name of the language, in that language.
   */
  label: string;
  messages: Partial<WordsRegistry>;
}

const DEFAULT_LOCALE = "en";

const english: Partial<Record<string, Message>> = {};
const locales = new Map<string, Partial<Record<string, Message>>>();
let activeLocale = DEFAULT_LOCALE;

/**
 * Adds English messages to the registry. English is the default language and the fallback of
 * every other one. The shell registers the messages of the core layer, the shared components,
 * itself and every feature of the app, before anything is rendered.
 *
 * @param messages - the messages to add
 */
export const registerMessages = (messages: Messages): void => {
  Object.assign(english, messages);
};

/**
 * Adds the messages of another language. Registering a language twice merges its messages.
 * Like the English messages, register it before the first render.
 *
 * @param localeModule - the language and its messages
 */
export const registerLocale = ({ locale, messages }: LocaleModule): void => {
  locales.set(locale, { ...locales.get(locale), ...(messages as Messages) });
};

/**
 * Sets the language `words` returns messages in. The app chooses its language when it starts, so
 * call it before the first render: components don't re-render when it changes, and some keep a
 * message they looked up once. Switching the language later means reloading the app.
 *
 * @param locale - the BCP 47 tag of a registered language, or "en"
 */
export const setLocale = (locale: string): void => {
  activeLocale = locale;
};

/**
 * Returns the message of a key, in the active language when it has one, in English otherwise.
 *
 * Don't call it while a module loads, e.g. to build a constant: the messages are only registered
 * once the app starts, and features loaded as a plugin even later.
 *
 * @param key - the key of the message
 * @returns the message: a string, or a function that builds one
 * @throws when no message is registered for the key, e.g. because its feature is not registered
 */
export const words = <K extends WordKey>(key: K): WordsRegistry[K] => {
  const message = locales.get(activeLocale)?.[key] ?? english[key];

  if (message === undefined) {
    throw new Error(`No message is registered for "${key}".`);
  }

  return message as WordsRegistry[K];
};
