import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";
import { drawerQuery } from "@S/Notification/Core/Query";
import { Updater } from "./Updater";

export function UpdateNotificationCommandManager(
  apiHelper: ApiHelper,
  store: Store
) {
  return CommandManagerWithEnv<"UpdateNotification">(
    "UpdateNotification",
    ({ origin }, environment) =>
      async (body, ids, cb) => {
        await Promise.all(
          ids.map((id) =>
            apiHelper.patch(`/api/v2/notification/${id}`, environment, body)
          )
        );
        if (origin === "drawer") {
          new Updater(apiHelper, store).update(drawerQuery, environment);
        } else {
          cb && cb();
        }
      }
  );
}
