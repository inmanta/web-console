import * as React from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  EmptyState,
  EmptyStateIcon,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

export const NotFound: React.FunctionComponent = () => {
  const history = useHistory();

  return (
    <PageSection variant="light">
      <EmptyState>
        <EmptyStateIcon icon={ExclamationTriangleIcon} />
        <Title headingLevel="h3" size="lg">
          {words("notFound.title")}
        </Title>
        <Button onClick={() => history.go(-1)}>{words("notFound.back")}</Button>
      </EmptyState>
    </PageSection>
  );
};
