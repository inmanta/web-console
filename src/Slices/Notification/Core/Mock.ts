import { NotificationQL } from "@/Data/Managers/V2/Notification/GetNotificationsQL";
import { Notification } from "./Domain";

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

export const list: Notification[] = [unread, read, error, withoutUri];

export const readQL: NotificationQL = {
  node: read,
};

export const errorQL: NotificationQL = {
  node: error,
};

export const unreadQL: NotificationQL = {
  node: unread,
};

export const withoutUriQL: NotificationQL = {
  node: withoutUri,
};

export const listQL: NotificationQL[] = [readQL, errorQL, unreadQL, withoutUriQL];
