import { Pagination } from "@/Test";
import { Notification } from "./Domain";
import { Manifest } from "./Query";

export const unread: Notification = {
  environment: "env",
  id: "abcdefgh01",
  created: "2021-01-11T12:56:56.205131",
  title: "Something happened",
  message: "An exporting compile has failed",
  severity: "info",
  uri: "/api/v2/compilereport/f2c68117-24bd-43cf-a9dc-ce42b934a614",
  read: false,
  cleared: false,
};

export const error: Notification = {
  ...unread,
  id: "abcdefgh02",
  severity: "error",
};

export const read: Notification = {
  ...unread,
  id: "abcdefgh03",
  severity: "info",
  read: true,
};
export const withoutUri: Notification = {
  ...unread,
  id: "abcdefgh04",
  uri: null,
};

export const response: Manifest["apiResponse"] = {
  data: [unread, error, read, withoutUri],
  metadata: Pagination.metadata,
  links: Pagination.links,
};

export const data: Manifest["usedData"] = {
  data: [unread, error, read, withoutUri],
  metadata: Pagination.metadata,
  handlers: Pagination.handlers,
};

export const list: Notification[] = [unread, read, error, withoutUri];
