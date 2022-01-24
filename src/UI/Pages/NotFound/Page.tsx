import * as React from "react";
import {
  Button,
  EmptyState,
  EmptyStateIcon,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useDocumentTitle } from "@/UI/Routing";
import { words } from "@/UI/words";

export const Page: React.FC = () => {
  useDocumentTitle("404 Page Not Found");
  const { routeManager } = React.useContext(DependencyContext);
  return (
    <PageSection variant="light">
      <EmptyState>
        <EmptyStateIcon icon={ExclamationTriangleIcon} />
        <Title headingLevel="h3" size="lg">
          {words("notFound.title")}
        </Title>
        <Link pathname={routeManager.getUrl("Home", undefined)}>
          <Button>{words("notFound.home")}</Button>
        </Link>
      </EmptyState>
    </PageSection>
  );
};
