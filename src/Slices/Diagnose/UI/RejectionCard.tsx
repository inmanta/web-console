import React, { useContext, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@patternfly/react-core";
import {
  Dropdown,
  DropdownItem,
  KebabToggle,
} from "@patternfly/react-core/deprecated";
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
  const dropdownItems: React.ReactNode[] = [
    <DropdownItem
      key="compileReportLink"
      component={
        <Link
          pathname={routeManager.getUrl("CompileDetails", {
            id: compile_id,
          })}
        >
          {words("diagnose.links.compileReport")}
        </Link>
      }
    />,
    ...(model_version
      ? [
          <DropdownItem
            key="modelVersionLink"
            component={
              <Link
                pathname={routeManager.getUrl("DesiredStateDetails", {
                  version: model_version.toString(),
                })}
              >
                {words("diagnose.links.modelVersionDetails")}
              </Link>
            }
          />,
        ]
      : []),
  ];

  return (
    <Card>
      <CardHeader
        actions={{
          actions: (
            <>
              <Dropdown
                onSelect={() => setIsOpen((value) => !value)}
                toggle={
                  <KebabToggle onToggle={() => setIsOpen((value) => !value)} />
                }
                isOpen={isOpen}
                isPlain
                dropdownItems={dropdownItems}
                position={"right"}
              />
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
