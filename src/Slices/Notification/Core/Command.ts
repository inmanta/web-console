import { Body, Model } from "./Model";
import { Origin } from "./Utils";

export interface Command {
  kind: "UpdateNotification";
  origin: Origin;
}

export interface Manifest {
  error: string;
  apiData: { data: Model };
  body: Body;
  command: Command;
  trigger: (body: Body, ids: string[], cb?: () => void) => void;
}
