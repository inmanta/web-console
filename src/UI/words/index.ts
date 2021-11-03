import inventory from "./inventory";
import settings from "./settings";
import common from "./common";
import events from "./events";
import resources from "./resources";
import home from "./home";
import catalog from "./catalog";
import navigation from "./navigation";
import compileDetails from "./compileDetails";
import compileReports from "./compileReports";
import codehighlighter from "./codehighlighter";
import diagnose from "./diagnose";
import history from "./history";
import config from "./config";
import error from "./error";
import environment from "./environment";

/**
 * This "words" module is responsible for all the text that
 * is presented to the user. This gives a nice overview.
 * If we need to change something, we can do it here.
 * We don't have to find the specific view. Values can also
 * be reused if their meaning is the same.
 *
 * The key should be a meaningful combination of words
 * seperated by dots. Using this method, you can have a
 * value for "inventory", but also for "inventory.state".
 */

const dict = {
  ...inventory,
  ...settings,
  ...common,
  ...events,
  ...resources,
  ...home,
  ...catalog,
  ...navigation,
  ...compileDetails,
  ...compileReports,
  ...codehighlighter,
  ...diagnose,
  ...history,
  ...config,
  ...error,
  ...environment,
};

export type Key = keyof typeof dict;

export const words = <K extends Key>(key: K): typeof dict[K] => dict[key];
