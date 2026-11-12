// Keeps the plugins' types (dayjs.utc, dayjs.tz, ...) in the generated declarations, so the packages
// that import this configured dayjs see them; the plugin imports below are only used as values.
/// <reference types="dayjs/plugin/customParseFormat" preserve="true" />
/// <reference types="dayjs/plugin/duration" preserve="true" />
/// <reference types="dayjs/plugin/relativeTime" preserve="true" />
/// <reference types="dayjs/plugin/timezone" preserve="true" />
/// <reference types="dayjs/plugin/utc" preserve="true" />
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// utc must be registered before timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(customParseFormat);

export default dayjs;
