import * as React from "react";
import {
  Button,
  EmptyState,
  EmptyStateIcon,
  PageSection,
  EmptyStateHeader,
  EmptyStateFooter,
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
        <EmptyStateHeader
          titleText={<>{words("notFound.title")}</>}
          icon={<EmptyStateIcon icon={ExclamationTriangleIcon} />}
          headingLevel="h3"
        />
        <EmptyStateFooter>
          <Link pathname={routeManager.getUrl("Home", undefined)}>
            <Button>{words("notFound.home")}</Button>
          </Link>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};
