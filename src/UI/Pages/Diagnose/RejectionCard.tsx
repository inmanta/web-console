import React, { useState } from "react";
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  KebabToggle,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Rejection } from "@/Core";
import { useNavigateTo } from "@/UI/Routing";
import { greyText } from "@/UI/Styles";
import { words } from "@/UI/words";
import { Pre } from "./Pre";
import { Traceback } from "./Traceback";

interface Props {
  rejection: Rejection;
}

export const RejectionCard: React.FC<Props> = ({
  rejection: { model_version, compile_id, trace, error },
}) => {
  const navigateTo = useNavigateTo();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems: React.ReactNode[] = [
    <DropdownItem
      key="compileReportLink"
      onClick={() =>
        navigateTo("CompileDetails", {
          id: compile_id,
        })
      }
    >
      {words("diagnose.links.compileReport")}
    </DropdownItem>,
    <DropdownItem
      key="modelVersionLink"
      isDisabled={model_version === undefined}
      onClick={
        model_version === undefined
          ? undefined
          : () =>
              navigateTo("DesiredStateDetails", {
                version: model_version.toString(),
              })
      }
    >
      {words("diagnose.links.modelVersionDetails")}
    </DropdownItem>,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{words("diagnose.rejection.title")}</CardTitle>
        <CardActions>
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
        </CardActions>
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
