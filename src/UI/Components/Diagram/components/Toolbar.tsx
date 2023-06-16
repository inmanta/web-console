import React from "react";
import "@inmanta/rappid/rappid.css";
import {
  Button,
  Flex,
  FlexItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";
import labelIcon from "../icons/label-icon.svg";
import entityIcon from "../icons/new-entity.svg";

const Toolbar = ({
  attrsToDisplay,
  setAttrsToDisplay,
  isToggleVisible,
  openEntityModal,
}: {
  attrsToDisplay: "active_attributes" | "candidate_attributes";
  setAttrsToDisplay: (
    attributeType: "active_attributes" | "candidate_attributes"
  ) => void;
  isToggleVisible: boolean;
  openEntityModal: () => void;
}) => {
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
          {isToggleVisible && (
            <>
              <FlexItem>
                <Spacer />
              </FlexItem>
              <FlexItem>
                <ToggleGroup aria-label="displayAttrsToggle">
                  <StyledToggleGroupItem
                    text="Candidate Attributes"
                    buttonId="displayAttrsToggle-candidates-button"
                    isSelected={attrsToDisplay === "candidate_attributes"}
                    onChange={() => setAttrsToDisplay("candidate_attributes")}
                  />
                  <StyledToggleGroupItem
                    text="Active Attributes"
                    buttonId="displayAttrsToggle-candidates-button"
                    isSelected={attrsToDisplay === "active_attributes"}
                    onChange={() => setAttrsToDisplay("active_attributes")}
                  />
                </ToggleGroup>
              </FlexItem>
            </>
          )}
        </Flex>
      </FlexItem>
      <FlexItem>
        <Flex
          spacer={{ default: "spacerMd" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <StyledButtonTwo variant="tertiary" width={200}>
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
const StyledToggleGroupItem = styled(ToggleGroupItem)`
  --pf-c-toggle-group__button--PaddingTop: 3px;
  --pf-c-toggle-group__button--PaddingBottom: 0px;
  --pf-c-toggle-group__button--FontSize: 1rem;
  button {
    height: 30px;
  }
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
