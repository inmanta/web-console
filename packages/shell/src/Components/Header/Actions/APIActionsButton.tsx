import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import { CodeIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { SearchHelper } from "@inmanta/web-console-core/Routing";

/**
 * A single icon-button dropdown in the header that groups the GraphiQL
 * explorer and the REST API / Swagger link together, keeping the header bar
 * uncluttered.
 */
export const APIActionsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { routeManager, urlManager, authHelper } = useContext(DependencyContext);
  const navigate = useNavigate();
  const { search } = useLocation();

  const handleSelect = () => setIsOpen(false);

  const hasGraphiQL = routeManager.has("GraphiQL");
  const graphiQLSearch = new SearchHelper().keepEnvOnly(search);

  // A new tab can't send the Authorization header, so the orchestrator's /api/v2/docs endpoint
  // reads the token from the query (token_param="token"). Never add the token to external links.
  const restApiUrl = authHelper.getToken()
    ? urlManager.getGeneralAPILink() + "?token=" + authHelper.getToken()
    : urlManager.getGeneralAPILink();

  return (
    <ToolbarItem>
      <Tooltip
        content={words("dashboard.apiActions.tooltip")}
        position="bottom"
        entryDelay={1000}
        isVisible={isOpen ? false : undefined}
      >
        <Dropdown
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={handleSelect}
          popperProps={{ position: "end" }}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              variant="plain"
              isExpanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={words("dashboard.apiActions.tooltip")}
              icon={<CodeIcon />}
            />
          )}
        >
          <DropdownList>
            {hasGraphiQL && (
              <DropdownItem
                onClick={() =>
                  navigate({
                    pathname: routeManager.getUrl("GraphiQL", undefined),
                    search: graphiQLSearch,
                  })
                }
              >
                {words("dashboard.apiActions.graphiql")}
              </DropdownItem>
            )}
            <DropdownItem to={restApiUrl} component="a" target="_blank" rel="noopener noreferrer">
              {words("dashboard.apiActions.restApi")}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </Tooltip>
    </ToolbarItem>
  );
};
