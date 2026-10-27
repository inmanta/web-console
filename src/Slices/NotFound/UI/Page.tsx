import * as React from "react";
import { Button, EmptyState, PageSection, EmptyStateFooter } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { words } from "@/Core";
import { Link } from "@/UI/Components/Link";
import { DependencyContext } from "@/UI/Dependency";
import { useDocumentTitle } from "@/UI/Routing";

export const Page: React.FC = () => {
  useDocumentTitle("404 Page Not Found");
  const { routeManager } = React.useContext(DependencyContext);

  return (
    <PageSection hasBodyWrapper={false}>
      <EmptyState
        headingLevel="h3"
        icon={ExclamationTriangleIcon}
        titleText={<>{words("notFound.title")}</>}
      >
        <EmptyStateFooter>
          <Link pathname={routeManager.getUrl("Dashboard", undefined)}>
            <Button>{words("notFound.home")}</Button>
          </Link>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};
