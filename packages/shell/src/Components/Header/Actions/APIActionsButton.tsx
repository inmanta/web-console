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
import { DependencyContext, useVisibleLinkActions } from "@inmanta/web-console-core/Dependency";
import { SearchHelper } from "@inmanta/web-console-core/Routing";

/**
 * A single icon-button dropdown in the header that groups the developer tools, keeping the header
 * bar uncluttered: the links the features add (e.g. GraphiQL), then the REST API / Swagger link.
 */
export const APIActionsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { routeManager, urlManager, authHelper } = useContext(DependencyContext);
  const navigate = useNavigate();
  const { search } = useLocation();

  const handleSelect = () => setIsOpen(false);

  const developerActions = useVisibleLinkActions("header.developerTools.actions");
  const envOnlySearch = new SearchHelper().keepEnvOnly(search);

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
            {developerActions.map(({ id, getLabel, getUrl, isDisabled }) => (
              <DropdownItem
                key={id}
                isDisabled={isDisabled?.({}) ?? false}
                onClick={() =>
                  navigate({ pathname: getUrl(routeManager, {}), search: envOnlySearch })
                }
              >
                {getLabel()}
              </DropdownItem>
            ))}
            <DropdownItem to={restApiUrl} component="a" target="_blank" rel="noopener noreferrer">
              {words("dashboard.apiActions.restApi")}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </Tooltip>
    </ToolbarItem>
  );
};
