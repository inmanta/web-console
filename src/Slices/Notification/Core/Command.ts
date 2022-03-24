import { Body, Model } from "./Model";

export interface Command {
  kind: "UpdateNotification";
}

export interface Manifest {
  error: string;
  apiData: { data: Model };
  body: Body;
  command: Command;
  trigger: (body: Body, ids: string[]) => void;
}
