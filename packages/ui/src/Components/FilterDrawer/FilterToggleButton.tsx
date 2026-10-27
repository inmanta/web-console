import React from "react";
import { Badge, Button, Flex, FlexItem } from "@patternfly/react-core";
import { FilterIcon } from "@patternfly/react-icons";

interface Props {
  onClick: () => void;
  isExpanded: boolean;
  activeFilterCount: number;
  label: string;
  isDanger?: boolean;
}

export const FilterToggleButton: React.FC<Props> = ({
  onClick,
  isExpanded,
  activeFilterCount,
  label,
  isDanger = false,
}) => (
  <Button
    {...(isDanger && { isDanger: true })}
    onClick={onClick}
    variant="link"
    icon={<FilterIcon />}
    iconPosition="end"
    aria-pressed={isExpanded}
  >
    <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsSm" }}>
      <FlexItem>
        <Badge {...(isDanger && { style: { backgroundColor: "var(--pf-t--color--red--60)" } })}>
          {activeFilterCount}
        </Badge>
      </FlexItem>
      <FlexItem>{label}</FlexItem>
    </Flex>
  </Button>
);
