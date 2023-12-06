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
import styled from "styled-components";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { greyText } from "@/UI/Styles";
import { getResourceIdFromResourceVersionId } from "@/UI/Utils";
import { words } from "@/UI/words";
import { Failure } from "@S/Diagnose/Core/Domain";
import { Pre } from "./Pre";

interface Props {
  resourceId: string;
  failure: Failure;
}

export const FailureCard: React.FC<Props> = ({ resourceId, failure }) => {
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems = (
    <DropdownList>
      <DropdownItem key="resourceDetailsLink">
        <Link
          pathname={routeManager.getUrl("ResourceDetails", {
            resourceId: getResourceIdFromResourceVersionId(resourceId),
          })}
        >
          {words("diagnose.links.resourceDetails")}
        </Link>
      </DropdownItem>
      <DropdownItem key="modelVersionLink">
        <Link
          pathname={routeManager.getUrl("DesiredStateDetails", {
            version: failure.model_version.toString(),
          })}
        >
          {words("diagnose.links.modelVersionDetails")}
        </Link>
      </DropdownItem>
    </DropdownList>
  );

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card>
      <CardHeader
        actions={{
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
                  >
                    <EllipsisVIcon />
                  </MenuToggle>
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
        }}
      >
        <CardTitle>{words("diagnose.failure.title")}</CardTitle>
      </CardHeader>
      <StyledCardTitle>{resourceId}</StyledCardTitle>
      <CardBody>
        <Pre>{failure.message}</Pre>
      </CardBody>
    </Card>
  );
};

const StyledCardTitle = styled(CardTitle)`
  ${greyText};
`;
