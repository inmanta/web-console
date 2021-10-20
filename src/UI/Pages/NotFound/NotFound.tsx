import * as React from "react";
import {
  Button,
  EmptyState,
  EmptyStateIcon,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { Link } from "@/UI/Components";
import { getUrl } from "@/UI/Routing";

export const NotFound: React.FunctionComponent = () => (
  <PageSection variant="light">
    <EmptyState>
      <EmptyStateIcon icon={ExclamationTriangleIcon} />
      <Title headingLevel="h3" size="lg">
        {words("notFound.title")}
      </Title>
      <Link pathname={getUrl("Home", undefined)}>
        <Button>{words("notFound.home")}</Button>
      </Link>
    </EmptyState>
  </PageSection>
);
