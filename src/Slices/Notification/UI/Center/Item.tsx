import React from "react";
import {
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  variantIcons,
} from "@patternfly/react-core";
import styled from "styled-components";
import { DateWithTooltip } from "@/UI/Components";
import { Notification, Severity } from "@S/Notification/Core/Domain";
import {
  getColorForVisualSeverity,
  getSeverityForNotification,
  VisualSeverity,
} from "@S/Notification/UI/Utils";
import { ActionList } from "./ActionList";

interface Props {
  notification: Notification;
  onUpdate(): void;
}

export const Item: React.FC<Props> = ({ notification, onUpdate }) => {
  const visualSeverity = getSeverityForNotification(notification.severity);

  return (
    <CustomItem
      aria-label="NotificationItem"
      $read={notification.read}
      $severity={visualSeverity}
    >
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <div>
                <Icon {...notification} />
                <Title $read={notification.read}>{notification.title}</Title>
              </div>
              <p>{notification.message}</p>

              <DateWithTooltip timestamp={notification.created} />
            </DataListCell>,
          ]}
        />
        <DataListAction
          aria-labelledby="multi-actions-item1 multi-actions-action1"
          id="multi-actions-action1"
          aria-label="Actions"
        >
          <ActionList {...{ onUpdate }} {...notification} />
        </DataListAction>
      </DataListItemRow>
    </CustomItem>
  );
};

const Icon: React.FC<{ severity: Severity }> = ({ severity }) => {
  const visualSeverity = getSeverityForNotification(severity);
  const Component = variantIcons[visualSeverity];

  return (
    <IconWrapper $severity={visualSeverity}>
      <Component />
    </IconWrapper>
  );
};

const IconWrapper = styled.span<{ $severity: VisualSeverity }>`
  color: ${(p) => getColorForVisualSeverity(p.$severity)};
  margin-right: 8px;
`;

const Title = styled.span<{ $read: boolean }>`
  font-weight: ${(p) => (p.$read ? "normal" : "bold")};
`;

interface CustomItemProps {
  $read: boolean;
  $severity: VisualSeverity;
}

const CustomItem = styled(DataListItem)<CustomItemProps>`
  --pf-v6-c-data-list__item--before--BackgroundColor: ${(p) =>
    p.$read ? "transparent" : getColorForVisualSeverity(p.$severity)};
`;
