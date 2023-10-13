import { identity } from "lodash";
import { QueryManager } from "@/Data/Managers/Helpers";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";

export function NotificationReadOnlyQueryManager(store: Store) {
  return QueryManager.ReadOnlyWithEnv<"GetNotifications">(
    StateHelper(store),
    "GetNotifications",
    identity,
  );
}
