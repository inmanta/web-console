import React from "react";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";

interface Props {
  message: string;
  title?: string;
  onResetFilters?: () => void;
}

/**
 * Shows a message in an empty state, with an optional Reset Filters button.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} message - The message to show.
 *  @prop {string} [title] - The title, defaults to a generic empty title.
 *  @prop {() => void} [onResetFilters] - Shows a Reset Filters button that calls this function.
 *    Pass it only when a filter is set, so the button never shows on a table that is just empty.
 *
 * @returns {React.FC<Props>} The empty view
 */
export const EmptyView: React.FC<Props> = ({ title, message, onResetFilters, ...props }) => (
  <EmptyState
    headingLevel="h2"
    icon={ExclamationCircleIcon}
    titleText={<>{title || words("empty.title")}</>}
    {...props}
  >
    <EmptyStateBody>{message}</EmptyStateBody>
    {onResetFilters && (
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="link" onClick={onResetFilters}>
            {words("resources.filters.active.resetFilters")}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    )}
  </EmptyState>
);
