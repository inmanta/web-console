import React from "react";
import { Banner, Flex, FlexItem } from "@patternfly/react-core";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

export const WarningBanner = ({
  instances,
}: {
  instances: string[] | undefined;
}) => {
  if (!instances || instances.length === 0) {
    return null;
  }

  return (
    <Banner screenReaderText="Info banner" variant="blue">
      <Flex spaceItems={{ default: "spaceItemsSm" }}>
        <FlexItem>
          <InfoCircleIcon />
        </FlexItem>
        <FlexItem>
          {words("inventory.instanceComposer.strict.warning")}
        </FlexItem>
        <br />
        {instances.map((instance) => (
          <FlexItem key={`strict-warning${instance}`}>{instance}</FlexItem>
        ))}
      </Flex>
    </Banner>
  );
};
