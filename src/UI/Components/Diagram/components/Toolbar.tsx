import React, { useCallback, useContext } from "react";
import "@inmanta/rappid/rappid.css";
import { useNavigate } from "react-router-dom";
import { Button, Flex, FlexItem, Tooltip } from "@patternfly/react-core";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import entityIcon from "../icons/new-entity-icon.svg";

const Toolbar = ({
  openEntityModal,
  handleDeploy,
  serviceName,
  isDeployDisabled,
}: {
  openEntityModal: () => void;
  handleDeploy: () => void;
  serviceName: string;
  isDeployDisabled: boolean;
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
        default: "justifyContentSpaceBetween",
      }}
      alignItems={{ default: "alignItemsFlexEnd" }}
    >
      <FlexItem>
        <Flex
          spacer={{ default: "spacerXs" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <FlexItem>
            <Tooltip
              content={words(
                "inventory.instanceComposer.addInstanceButtonTooltip",
              )}
            >
              <IconButton
                variant="secondary"
                onClick={(event) => {
                  event.currentTarget.blur();
                  openEntityModal();
                }}
                aria-label="new-entity-button"
              >
                <img
                  src={entityIcon}
                  alt="Create new entity icon"
                  aria-label="new-entity-icon"
                />{" "}
                {words("inventory.addInstance.button")}
              </IconButton>
            </Tooltip>
          </FlexItem>
          {/* <FlexItem>
            <Tooltip
              content={words("inventory.instanceComposer.labelButtonTooltip")}
            >
              <IconButton
                variant="secondary"
                aria-label="label-toggle-button"
                onClick={(event) => {
                  document.querySelectorAll(".labels").forEach((label) => {
                    if (label.classList.contains("-show")) {
                      label.classList.remove("-show");
                    } else {
                      label.classList.add("-show");
                    }
                  });
                  event.currentTarget.blur();
                }}
              >
                <img
                  src={labelIcon}
                  alt="Label Toggle Icon"
                  aria-label="label-toggle-icon"
                />
              </IconButton>
            </Tooltip>
          </FlexItem> */}
        </Flex>
      </FlexItem>
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
            isDisabled={isDeployDisabled}
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

const IconButton = styled(Button)`
  --pf-v5-c-button--PaddingTop: 3px;
  --pf-v5-c-button--PaddingRight: 10px;
  --pf-v5-c-button--PaddingBottom: 3px;
  --pf-v5-c-button--PaddingLeft: 10px;
  height: 36px;
`;

const StyledButton = styled(Button)`
  --pf-v5-c-button--PaddingTop: 3px;
  --pf-v5-c-button--PaddingBottom: 3px;
  width: 101px;
  height: 36px;
`;
