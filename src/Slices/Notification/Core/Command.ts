import { Body, Notification } from "./Domain";
import { Origin } from "./Utils";

export interface Command {
  kind: "UpdateNotification";
  origin: Origin;
}

export interface Manifest {
  error: string;
  apiData: { data: Notification };
  body: Body;
  command: Command;
  trigger: (body: Body, ids: string[], cb?: () => void) => void;
}
