import React from "react";
import { DataList } from "@patternfly/react-core";
import { Manifest } from "@S/Notification/Core/Query";
import { Item } from "./Item";

interface Props {
  data: Manifest["usedData"]["data"];
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
