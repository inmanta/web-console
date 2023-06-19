import React, { useCallback, useContext } from "react";
import "@inmanta/rappid/rappid.css";
import { useNavigate } from "react-router-dom";
import { Button, Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import labelIcon from "../icons/label-icon.svg";
import entityIcon from "../icons/new-entity.svg";

const Toolbar = ({
  openEntityModal,
  serviceName,
}: {
  openEntityModal: () => void;
  serviceName: string;
}) => {
  const { routeManager } = useContext(DependencyContext);
  const navigate = useNavigate();
  const url = routeManager.useUrl("Inventory", {
    service: serviceName,
  });
  const handleRedirect = useCallback(
    () => navigate(url),
    [navigate] /* eslint-disable-line react-hooks/exhaustive-deps */
  );
  return (
    <Container
      justifyContent={{
        default: "justifyContentSpaceBetween",
      }}
    >
      <FlexItem>
        <Flex
          spacer={{ default: "spacerXs" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <FlexItem>
            <StyledButton
              variant="secondary"
              onClick={openEntityModal}
              aria-label="new-entity-button"
            >
              <img
                src={entityIcon}
                alt="Create new entity icon"
                aria-label="new-entity-icon"
              />
            </StyledButton>
          </FlexItem>
          <FlexItem>
            <Spacer />
          </FlexItem>
          <FlexItem>
            <StyledButton variant="secondary">
              <img
                src={labelIcon}
                alt="Inmanta Logo"
                aria-label="Inmanta Logo"
              />
            </StyledButton>
          </FlexItem>
        </Flex>
      </FlexItem>
      <FlexItem>
        <Flex
          spacer={{ default: "spacerMd" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <StyledButtonTwo
            variant="tertiary"
            width={200}
            onClick={handleRedirect}
          >
            {words("cancel")}
          </StyledButtonTwo>
          <StyledButtonTwo variant="primary" width={200}>
            {words("deploy")}
          </StyledButtonTwo>
        </Flex>
      </FlexItem>
    </Container>
  );
};
export default Toolbar;

const Container = styled(Flex)`
  padding: 0 0 20px;
`;

const StyledButton = styled(Button)`
  --pf-c-button--PaddingTop: 5px;
  --pf-c-button--PaddingRight: 3px;
  --pf-c-button--PaddingBottom: 3px;
  --pf-c-button--PaddingLeft: 3px;
  height: 30px;
  width: 30px;
`;

const StyledButtonTwo = styled(Button)`
  --pf-c-button--PaddingTop: px;
  --pf-c-button--PaddingBottom: 0px;
  width: 101px;
  height: 30px;
`;

const Spacer = styled.div`
  display: flex;
  height: 30px;
  width: 1px;
  background: #e7e7e7;
`;
