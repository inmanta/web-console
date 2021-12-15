import React from "react";
import { Button, Flex, FlexItem } from "@patternfly/react-core";
import { words } from "@/UI/words";

export const Actions: React.FC = () => (
  <Flex direction={{ default: "column", "2xl": "row" }}>
    <FlexItem>
      <Button isDisabled variant="primary">
        {words("desiredState.actions.details")}
      </Button>
    </FlexItem>
    <FlexItem>
      <Button isDisabled variant="secondary">
        {words("desiredState.actions.promote")}
      </Button>
    </FlexItem>
  </Flex>
);
