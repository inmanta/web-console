export enum LogLevelNumber {
  CRITICAL = 50,
  ERROR = 40,
  WARNING = 30,
  INFO = 20,
  DEBUG = 10,
  TRACE = 3,
}

export enum LogLevelString {
  CRITICAL = "CRITICAL",
  ERROR = "ERROR",
  WARNING = "WARNING",
  DEBUG = "DEBUG",
}

export const LogLevelsList = Object.values(LogLevelString);
