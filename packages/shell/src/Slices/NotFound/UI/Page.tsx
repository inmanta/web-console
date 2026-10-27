import * as React from "react";
import { Button, EmptyState, PageSection, EmptyStateFooter } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useDocumentTitle } from "@inmanta/web-console-core/Routing";
import { Link } from "@inmanta/web-console-ui/Components/Link";

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
