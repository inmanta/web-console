import React, { useContext, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { Failure } from "@inmanta/web-console-core/Domain/Diagnostics";
import { Link } from "@inmanta/web-console-ui/Components/Link";
import { getResourceIdFromResourceVersionId } from "@inmanta/web-console-ui/Utils";
import { Pre } from "./Pre";

interface Props {
  resourceId: string;
  failure: Failure;
}

export const FailureCard: React.FC<Props> = ({ resourceId, failure }) => {
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  // The links go to pages of the resource manager and the orchestration engine, so each is only
  // there when the app has that feature.
  const hasResourceDetailsLink = routeManager.has("ResourceDetails");
  const hasModelVersionLink = routeManager.has("DesiredStateDetails");
  const dropdownItems = (
    <DropdownList>
      {hasResourceDetailsLink && (
        <DropdownItem key="resourceDetailsLink">
          <Link
            pathname={routeManager.getUrl("ResourceDetails", {
              resourceId: getResourceIdFromResourceVersionId(resourceId),
            })}
          >
            {words("diagnose.links.resourceDetails")}
          </Link>
        </DropdownItem>
      )}
      {hasModelVersionLink && (
        <DropdownItem key="modelVersionLink">
          <Link
            pathname={routeManager.getUrl("DesiredStateDetails", {
              version: failure.model_version.toString(),
            })}
          >
            {words("diagnose.links.modelVersionDetails")}
          </Link>
        </DropdownItem>
      )}
    </DropdownList>
  );

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card>
      <CardHeader
        actions={
          hasResourceDetailsLink || hasModelVersionLink
            ? {
                actions: (
                  <>
                    <Dropdown
                      onSelect={() => setIsOpen((value) => !value)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          aria-label="actions-dropdown"
                          variant="plain"
                          onClick={onToggleClick}
                          isExpanded={isOpen}
                          icon={<EllipsisVIcon />}
                        />
                      )}
                      isOpen={isOpen}
                      popperProps={{ position: "right" }}
                      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
                    >
                      {dropdownItems}
                    </Dropdown>
                  </>
                ),
                hasNoOffset: false,
                className: undefined,
              }
            : undefined
        }
      >
        <CardTitle>{words("diagnose.failure.title")}</CardTitle>
      </CardHeader>
      <CardTitle>{resourceId}</CardTitle>
      <CardBody>
        <Pre>{failure.message}</Pre>
      </CardBody>
    </Card>
  );
};
