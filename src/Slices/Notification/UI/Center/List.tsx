import React from "react";
import { DataList } from "@patternfly/react-core";
import { NotificationResponse } from "@/Data/Managers/V2/Notification/GetNotifications";
import { Item } from "./Item";

interface Props {
  data: NotificationResponse["data"];
  onUpdate(): void;
}

export const List: React.FC<Props> = ({ data, onUpdate }) => {
  return (
    <DataList aria-label="NotificationList">
      {data.map((notification) => (
        <Item {...{ notification, onUpdate }} key={notification.id} />
      ))}
    </DataList>
  );
};
