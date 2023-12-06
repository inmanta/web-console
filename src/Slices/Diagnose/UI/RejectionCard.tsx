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
import { words } from "@/UI/words";
import { Rejection } from "@S/Diagnose/Core/Domain";
import { Pre } from "./Pre";
import { Traceback } from "./Traceback";

interface Props {
  rejection: Rejection;
}

export const RejectionCard: React.FC<Props> = ({
  rejection: { model_version, compile_id, trace, error },
}) => {
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems: React.ReactNode = (
    <DropdownList>
      <DropdownItem key="compileReportLink">
        <Link
          pathname={routeManager.getUrl("CompileDetails", {
            id: compile_id,
          })}
        >
          {words("diagnose.links.compileReport")}
        </Link>
      </DropdownItem>
      {model_version ? (
        <DropdownItem key="modelVersionLink">
          <Link
            pathname={routeManager.getUrl("DesiredStateDetails", {
              version: model_version.toString(),
            })}
          >
            {words("diagnose.links.modelVersionDetails")}
          </Link>
        </DropdownItem>
      ) : null}
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
                    aria-label="repair-deploy-dropdown"
                    variant="plain"
                    onClick={onToggleClick}
                    isExpanded={isOpen}
                  >
                    <EllipsisVIcon />
                  </MenuToggle>
                )}
                isOpen={isOpen}
                isPlain
                onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
                popperProps={{ position: "center" }}
              >
                {dropdownItems}
              </Dropdown>
            </>
          ),
          hasNoOffset: false,
          className: undefined,
        }}
      >
        <CardTitle>{words("diagnose.rejection.title")}</CardTitle>
      </CardHeader>
      {error && <StyledCardTitle>{error.type}</StyledCardTitle>}
      <CardBody>
        {error && <Pre>{error.message}</Pre>}
        {trace && <Traceback trace={trace} />}
      </CardBody>
    </Card>
  );
};

const StyledCardTitle = styled(CardTitle)`
  ${greyText}
`;
