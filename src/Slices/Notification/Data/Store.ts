import { Action, action } from "easy-peasy";
import { Origin } from "@S/Notification/Core/Query";
import { ApiData } from "@S/Notification/Core/Utils";

export interface NotificationSlice {
  listByEnvForDrawer: Record<string, ApiData>;
  listByEnvForCenter: Record<string, ApiData>;
  setList: Action<
    NotificationSlice,
    {
      environment: string;
      origin: Origin;
      data: ApiData;
    }
  >;
}

export const notificationSlice: NotificationSlice = {
  listByEnvForDrawer: {},
  listByEnvForCenter: {},
  setList: action((state, { environment, data, origin }) => {
    switch (origin) {
      case "center": {
        state.listByEnvForCenter[environment] = data;
        return;
      }
      case "drawer": {
        state.listByEnvForDrawer[environment] = data;
        return;
      }
    }
  }),
};
