import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";
import { drawerQuery } from "@S/Notification/Core/Query";
import { Updater } from "./Updater";

export class UpdateNotificationCommandManager extends CommandManagerWithEnv<"UpdateNotification"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly store: Store
  ) {
    super(
      "UpdateNotification",
      ({ origin }, environment) =>
        async (body, ids, cb) => {
          await Promise.all(
            ids.map((id) =>
              this.apiHelper.patch(
                `/api/v2/notification/${id}`,
                environment,
                body
              )
            )
          );
          if (origin === "drawer") {
            new Updater(this.apiHelper, this.store).update(
              drawerQuery,
              environment
            );
          } else {
            cb && cb();
          }
        }
    );
  }
}
