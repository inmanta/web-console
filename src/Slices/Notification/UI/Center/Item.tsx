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
import { MomentDatePresenter } from "@/UI/Utils";
import { Model, Severity } from "@S/Notification/Core/Model";
import {
  getColorForVisualSeverity,
  getSeverityForNotification,
  VisualSeverity,
} from "@S/Notification/UI/Utils";
import { ActionList } from "./ActionList";

interface Props {
  notification: Model;
  onUpdate(): void;
}

export const Item: React.FC<Props> = ({ notification, onUpdate }) => {
  const visualSeverity = getSeverityForNotification(notification.severity);
  return (
    <CustomItem
      aria-label="NotificationRow"
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
              <Timestamp>
                {new MomentDatePresenter().get(notification.created).relative}
              </Timestamp>
            </DataListCell>,
          ]}
        />
        <DataListAction
          aria-labelledby="multi-actions-item1 multi-actions-action1"
          id="multi-actions-action1"
          aria-label="Actions"
          isPlainButtonAction
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
  --pf-c-data-list__item-row--PaddingRight: 16px;
  --pf-c-data-list__item-row--PaddingLeft: 16px;
  --pf-c-data-list__item-content--md--PaddingBottom: 16px;
  --pf-c-data-list__cell--PaddingTop: 16px;
  --pf-c-data-list__item-action--PaddingBottom: 16px;
  --pf-c-data-list__item-action--PaddingTop: 16px;
  --pf-c-data-list__item--before--BackgroundColor: ${(p) =>
    p.$read ? "transparent" : getColorForVisualSeverity(p.$severity)};
`;

const Timestamp = styled.div`
  color: var(--pf-global--Color--200);
  font-size: var(--pf-global--FontSize--sm);
`;
