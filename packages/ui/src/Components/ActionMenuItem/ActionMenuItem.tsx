import React from "react";
import { Content, DropdownItem, Flex, FlexItem, Icon } from "@patternfly/react-core";
import { PlayIcon } from "@patternfly/react-icons";

const iconStyle = { color: "var(--pf-t--global--icon--color--subtle)" };

interface Props {
  // PatternFly icons all share one component type.
  IconComponent: typeof PlayIcon;
  label: string;
  hint?: string;
  tooltip?: string;
  isDisabled?: boolean;
  onClick: () => void;
}

/**
 * An item of an action menu: a subtle icon, the label, and a small hint on the right, like the
 * number of resources the action runs on. A disabled item keeps its tooltip, so it can say why.
 *
 * @props {Props} props - The component props
 *  @prop {typeof PlayIcon} IconComponent - The icon in front of the label
 *  @prop {string} label - The name of the action
 *  @prop {string} [hint] - The hint on the right, left out when there is none
 *  @prop {string} [tooltip] - The tooltip of the item
 *  @prop {boolean} [isDisabled] - Whether the item is disabled
 *  @prop {() => void} onClick - Called when the item is clicked
 *
 * @returns {React.FC<Props>} The menu item
 */
export const ActionMenuItem: React.FC<Props> = ({
  IconComponent,
  label,
  hint,
  tooltip,
  isDisabled,
  onClick,
}) => (
  <DropdownItem
    icon={
      <Icon size="sm">
        <IconComponent style={iconStyle} />
      </Icon>
    }
    onClick={onClick}
    isAriaDisabled={isDisabled}
    tooltipProps={tooltip ? { content: tooltip } : undefined}
  >
    <Flex
      justifyContent={{ default: "justifyContentSpaceBetween" }}
      alignItems={{ default: "alignItemsCenter" }}
      columnGap={{ default: "columnGapMd" }}
    >
      <FlexItem>{label}</FlexItem>
      {hint && (
        <FlexItem>
          <Content component="small">{hint}</Content>
        </FlexItem>
      )}
    </Flex>
  </DropdownItem>
);
