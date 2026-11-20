import React, { useId, useState } from "react";
import {
  Content,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  Flex,
} from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { ResourceDiff } from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/ResourceDiff";
import { StatusDescriptor } from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/StatusDescriptor";
import {
  DiffSideLabels,
  Item,
  Refs,
} from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";
import { ResourceLink } from "@inmanta/web-console-ui/Components/ResourceLink";

interface Props extends DiffSideLabels {
  item: Item;
  refs: Refs;
}

/**
 * One resource in a diff, as a row of a compact data list: its status and a link to the resource,
 * expanding into its diff.
 *
 * @props {Props} props - The props of the component
 *  @prop {Item} item - The resource and its changes
 *  @prop {Refs} refs - Where the row registers itself, so the jump-to list can scroll to it
 *  @prop {string} fromLabel - The display text of the side the diff starts from
 *  @prop {string} toLabel - The display text of the side the diff goes to
 *
 * @returns {React.FC<Props>} The diff row
 */
const BlockRow: React.FC<Props> = ({ item, refs, fromLabel, toLabel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const titleId = useId();
  const contentId = useId();

  return (
    <DataListItem aria-labelledby={titleId} isExpanded={isExpanded} data-testid="DiffBlock">
      <DataListItemRow>
        <DataListToggle
          style={{ alignItems: "center" }}
          id={`${contentId}-toggle`}
          isExpanded={isExpanded}
          aria-controls={contentId}
          onClick={() => setIsExpanded(!isExpanded)}
        />
        <DataListItemCells
          dataListCells={[
            <DataListCell key="resource">
              {/* The jump-to list scrolls to this title; the margin keeps the whole row in view. */}
              <div
                id={titleId}
                style={{ scrollMarginTop: "var(--pf-t--global--spacer--md)" }}
                ref={(element) => {
                  if (element) {
                    refs.current[item.id] = element;
                  } else {
                    delete refs.current[item.id];
                  }
                }}
              >
                {/* Keeps the body text size; the compact list shrinks its text to small. */}
                <Content>
                  <Flex
                    alignItems={{ default: "alignItemsCenter" }}
                    gap={{ default: "gapNone" }}
                    flexWrap={{ default: "nowrap" }}
                  >
                    <StatusDescriptor status={item.status} />
                    <ResourceLink resourceId={item.id} isInline />
                  </Flex>
                </Content>
              </div>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
      <DataListContent
        id={contentId}
        aria-label={words("desiredState.compare.changes")(item.id)}
        isHidden={!isExpanded}
        hasNoPadding
      >
        {/* Less padding than the data list's default, which even the compact list keeps large.
            None at the bottom, where the data list adds its own margin under the content. */}
        <div
          style={{
            padding: "var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--md) 0",
          }}
        >
          {/* Only rendered while open, since computing every diff up front is slow. */}
          {isExpanded && <ResourceDiff item={item} fromLabel={fromLabel} toLabel={toLabel} />}
        </div>
      </DataListContent>
    </DataListItem>
  );
};

/**
 * The diff row, skipped when the list re-renders with the same item, like when the Compliance
 * Check page polls its list of reports.
 */
export const Block = React.memo(BlockRow);
