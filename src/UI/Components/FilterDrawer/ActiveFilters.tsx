import React from "react";
import {
  Button,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { words } from "@/UI/words";

interface ActiveFiltersProps {
  hasActiveFilters: boolean;
  onClear: () => void;
  children: React.ReactNode;
  clearLabel?: string;
  emptyStateBody?: string;
}

/**
 * The ActiveFilters component.
 *
 * Shared shell for the "Active filters" section of a filter drawer: a header with a
 * reset/clear link, followed by either the chip groups (passed as children, typically
 * ActiveFilterGroup entries) or an empty state. Renders as a StackItem so it slots
 * directly into a drawer body Stack.
 *
 * @Props {ActiveFiltersProps} - Component props.
 *  @prop {boolean} hasActiveFilters - Whether any filter is active; toggles chips vs the empty state.
 *  @prop {() => void} onClear - Callback executed when the reset/clear link is pressed.
 *  @prop {React.ReactNode} children - The chip groups to render when filters are active.
 *  @prop {string} [clearLabel] - Label for the reset/clear link. Defaults to "Reset Filters".
 *  @prop {string} [emptyStateBody] - Body text of the empty state. Defaults to the no-tabs variant.
 *
 * @returns {React.ReactElement} The rendered active filters section.
 */
export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  hasActiveFilters,
  onClear,
  children,
  clearLabel = words("resources.filters.active.resetFilters"),
  emptyStateBody = words("resources.filters.active.empty.body.noTabs"),
}) => (
  <StackItem>
    <Flex
      justifyContent={{ default: "justifyContentSpaceBetween" }}
      alignItems={{ default: "alignItemsCenter" }}
    >
      <FlexItem>
        <Title headingLevel="h3" size="md">
          {words("resources.filters.active.title")}
        </Title>
      </FlexItem>
      <FlexItem>
        <Button variant="link" isInline onClick={onClear}>
          {clearLabel}
        </Button>
      </FlexItem>
    </Flex>
    {hasActiveFilters ? (
      <Stack hasGutter style={{ padding: "1rem 0" }}>
        {children}
      </Stack>
    ) : (
      <EmptyState variant="xs">
        <Title headingLevel="h4" size="md">
          {words("resources.filters.active.empty.title")}
        </Title>
        <EmptyStateBody>{emptyStateBody}</EmptyStateBody>
      </EmptyState>
    )}
  </StackItem>
);
