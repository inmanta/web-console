import { Pagination } from "@/Test";
import { Model } from "./Model";
import { Manifest } from "./Query";

export const unread: Model = {
  environment: "env",
  id: "abcdefgh01",
  created: "2021-01-11T12:56:56.205131",
  title: "Something happened",
  message: "",
  severity_level: "info",
  uri: "",
  read: false,
  cleared: false,
};

export const error: Model = {
  ...unread,
  id: "abcdefgh02",
  severity_level: "error",
};

export const read: Model = {
  ...unread,
  id: "abcdefgh04",
  severity_level: "info",
  read: true,
};

export const response: Manifest["apiResponse"] = {
  data: [unread, error, read],
  metadata: Pagination.metadata,
  links: Pagination.links,
};

export const data: Manifest["usedData"] = {
  data: [unread, error, read],
  metadata: Pagination.metadata,
  handlers: Pagination.handlers,
};
