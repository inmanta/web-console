import React, { useContext, useEffect, useState } from "react";
import {
  NotificationBadge,
  NotificationBadgeVariant,
} from "@patternfly/react-core";
import styled from "styled-components";
import { RemoteData } from "@/Core";
import { ErrorToastAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Model } from "@S/Notification/Core/Model";
import { drawerQuery } from "@S/Notification/Core/Query";
import { ViewData } from "@S/Notification/Core/Utils";

export const Badge: React.FC<{ onClick(): void }> = ({ onClick }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"GetNotifications">(drawerQuery);

  return <View {...{ data, onClick }} />;
};

interface Props {
  onClick(): void;
  data: ViewData;
}

export const View: React.FC<Props> = ({ data, onClick }) => {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!RemoteData.isFailed(data)) return;
    setError(data.value);
  }, [data]);

  return RemoteData.fold(
    {
      notAsked: () => (
        <PlainBadge variant={NotificationBadgeVariant.read} isDisabled />
      ),
      loading: () => (
        <PlainBadge variant={NotificationBadgeVariant.read} isDisabled />
      ),
      failed: () => (
        <>
          <ErrorToastAlert
            errorMessage={error}
            title={words("error")}
            setErrorMessage={setError}
          />
          <PlainBadge variant={NotificationBadgeVariant.read} isDisabled />
        </>
      ),
      success: ({ data: notifications }) => {
        const variant = getVariantFromNotifications(notifications);
        return (
          <NotificationBadge
            aria-label={getAriaLabelForVariant(variant)}
            variant={variant}
            onClick={onClick}
          />
        );
      },
    },
    data
  );
};

const getVariantFromNotifications = (
  notifications: Model[]
): NotificationBadgeVariant => {
  if (notifications.some(isUnreadError)) {
    return NotificationBadgeVariant.attention;
  }
  if (notifications.some(isUnread)) return NotificationBadgeVariant.unread;
  return NotificationBadgeVariant.read;
};

const isUnreadError = (notification: Model) =>
  isUnread(notification) && isError(notification);

const isError = (notification: Model) => notification.severity === "error";

const isUnread = (notification: Model) => notification.read === false;

const getAriaLabelForVariant = (variant: NotificationBadgeVariant): string => {
  switch (variant) {
    case NotificationBadgeVariant.attention:
      return "Badge-Error";
    case NotificationBadgeVariant.unread:
      return "Badge-Unread";
    case NotificationBadgeVariant.read:
      return "Badge-Read";
  }
};

const PlainBadge = styled(NotificationBadge)`
  --pf-c-button--m-plain--hover--Color: var(--pf-global--Color--200);
  --pf-c-button--m-plain--focus--Color: var(--pf-global--Color--200);
  --pf-c-button--m-plain--active--Color: var(--pf-global--Color--200);
`;
