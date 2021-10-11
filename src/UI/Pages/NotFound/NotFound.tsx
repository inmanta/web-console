import * as React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  EmptyState,
  EmptyStateIcon,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

export const NotFound: React.FunctionComponent = () => (
  <PageSection variant="light">
    <EmptyState>
      <EmptyStateIcon icon={ExclamationTriangleIcon} />
      <Title headingLevel="h3" size="lg">
        {words("notFound.title")}
      </Title>
      <Link to={{ pathname: "/", search: location.search }}>
        <Button>{words("notFound.back")}</Button>
      </Link>
    </EmptyState>
  </PageSection>
);
