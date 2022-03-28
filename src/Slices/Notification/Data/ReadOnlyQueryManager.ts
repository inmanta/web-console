import { identity } from "lodash";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";

export class NotificationReadOnlyQueryManager extends QueryManager.ReadOnlyWithEnv<"GetNotifications"> {
  constructor(store: Store) {
    super(new StateHelper(store), "GetNotifications", identity);
  }
}
