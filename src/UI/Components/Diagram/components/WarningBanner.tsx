import React from "react";
import { Banner, Flex, FlexItem } from "@patternfly/react-core";
import { InfoCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@/UI/words";

/**
 * Renders a warning banner component.
 *
 * @component
 * @param {string[]} instances - The list of instances to display in the banner.
 * @returns {JSX.Element|null} The rendered warning banner component.
 */
export const WarningBanner = ({
  instances,
}: {
  instances: string[] | undefined;
}) => {
  if (!instances || instances.length === 0) {
    return null;
  }

  return (
    <StyledBanner screenReaderText="Info banner" variant="blue">
      <Flex spaceItems={{ default: "spaceItemsSm" }}>
        <FlexItem>
          <InfoCircleIcon />
        </FlexItem>
        <FlexItem>
          {words("inventory.instanceComposer.strict.warning")}
        </FlexItem>
        <br />
      </Flex>
      <Flex>
        <FlexItem>{instances.map((instance) => instance + ", ")}</FlexItem>
      </Flex>
    </StyledBanner>
  );
};

const StyledBanner = styled(Banner)`
  position: absolute;
  z-index: 9999;
  width: 100%;
`;
