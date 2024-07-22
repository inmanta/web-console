import React, { useCallback, useContext } from "react";
import "@inmanta/rappid/joint-plus.css";
import { useNavigate } from "react-router-dom";
import { Button, Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

const Toolbar = ({
  handleDeploy,
  serviceName,
  isDeployDisabled,
  editable,
}: {
  handleDeploy: () => void;
  serviceName: string;
  isDeployDisabled: boolean;
  editable: boolean;
}) => {
  const { routeManager } = useContext(DependencyContext);
  const navigate = useNavigate();
  const url = routeManager.useUrl("Inventory", {
    service: serviceName,
  });
  const handleRedirect = useCallback(() => navigate(url), [navigate, url]);

  return (
    <Container
      justifyContent={{
        default: "justifyContentFlexEnd",
      }}
      alignItems={{ default: "alignItemsFlexEnd" }}
    >
      <FlexItem>
        <Flex
          spacer={{ default: "spacerMd" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <StyledButton variant="tertiary" width={200} onClick={handleRedirect}>
            {words("cancel")}
          </StyledButton>
          <StyledButton
            variant="primary"
            width={200}
            onClick={handleDeploy}
            isDisabled={isDeployDisabled || !editable}
          >
            {words("deploy")}
          </StyledButton>
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
  --pf-v5-c-button--PaddingTop: 3px;
  --pf-v5-c-button--PaddingBottom: 3px;
  width: 101px;
  height: 36px;
`;
