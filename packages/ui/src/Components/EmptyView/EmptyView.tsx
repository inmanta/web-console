import React from "react";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from "@patternfly/react-core";
import { ExclamationCircleIcon, SearchIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";

interface Props {
  message: string;
  title?: string;
  onResetFilters?: () => void;
}

/**
 * Shows a message in an empty state.
 *
 * With onResetFilters, the result is empty because of a filter, so it follows PatternFly's
 * "no results found" pattern instead: a search icon, a generic title and message, and a
 * Reset Filters button.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} message - The message to show when no filter is set.
 *  @prop {string} [title] - The title when no filter is set, defaults to a generic empty title.
 *  @prop {() => void} [onResetFilters] - Shows the filtered variant with a Reset Filters button
 *    that calls this function. Pass it only when a filter is set.
 *
 * @returns {React.FC<Props>} The empty view
 */
export const EmptyView: React.FC<Props> = ({ title, message, onResetFilters, ...props }) =>
  onResetFilters ? (
    <EmptyState
      headingLevel="h2"
      icon={SearchIcon}
      titleText={words("empty.filtered.title")}
      {...props}
    >
      <EmptyStateBody>{words("empty.filtered.message")}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="link" onClick={onResetFilters}>
            {words("resources.filters.active.resetFilters")}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  ) : (
    <EmptyState
      headingLevel="h2"
      icon={ExclamationCircleIcon}
      titleText={<>{title || words("empty.title")}</>}
      {...props}
    >
      <EmptyStateBody>{message}</EmptyStateBody>
    </EmptyState>
  );
