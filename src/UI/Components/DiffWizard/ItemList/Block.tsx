import React, { useId, useState } from "react";
import {
  Bullseye,
  Button,
  Content,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  DescriptionList,
  Flex,
} from "@patternfly/react-core";
import { StatusDescriptor } from "@/UI/Components/DiffWizard/StatusDescriptor";
import { Classification, Item, Refs } from "@/UI/Components/DiffWizard/types";
import { Resource, words } from "@inmanta/web-console-core";
import { ResourceLink } from "@inmanta/web-console-ui/Components/ResourceLink";
import { Entry } from "./Entry/Entry";

type Classify = (title: string, entryTitle: string, from: string, to: string) => Classification;

interface Props {
  item: Item;
  refs: Refs;
  classify?: Classify;
}

/**
 * One resource in a diff, as a row of a compact data list: its status and a link to the resource,
 * expanding into its changes.
 *
 * @props {Props} props - The props of the component
 *  @prop {Item} item - The resource and its changes
 *  @prop {Refs} refs - Where the row registers itself, so the jump-to list can scroll to it
 *  @prop {Classify} [classify] - Picks how an attribute's change is shown
 *
 * @returns {React.FC<Props>} The diff row
 */
const BlockRow: React.FC<Props> = ({ item, refs, classify }) => {
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
        {/* Less padding than the data list's default, which even the compact list keeps large. */}
        <div
          style={{
            padding: "var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)",
          }}
        >
          {/* Only rendered while open, since computing every diff up front is slow. */}
          {isExpanded && <Body item={item} classify={classify} />}
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

const Body: React.FC<{ item: Item; classify?: Classify }> = ({ item, classify }) => {
  switch (item.status) {
    case "deleted":
      return (
        <BodyWithToggle
          item={item}
          message={words("desiredState.compare.deleted")}
          actionLabel={words("desiredState.compare.deleted.action")}
          classify={classify}
        />
      );
    case "added":
    case "modified":
      return <BodyWithChanges item={item} classify={classify} />;

    case "unmodified":
      return <BodyWithMessage message={words("desiredState.compare.unmodified")} />;
    case "agent_down": {
      const agent = Resource.IdParser.getAgentName(item.id) ?? "???";

      return <BodyWithMessage message={words("desiredState.compare.agent_down")(agent)} />;
    }

    case "undefined":
      return <BodyWithMessage message={words("desiredState.compare.undefined")} />;
    case "skipped_for_undefined":
      return <BodyWithMessage message={words("desiredState.compare.skipped_for_undefined")} />;
    default:
      return null;
  }
};

const BodyWithToggle: React.FC<{
  item: Item;
  message: string;
  actionLabel: string;
  classify?: Classify;
}> = ({ item, message, actionLabel, classify }) => {
  const [isShown, setIsShown] = useState(false);

  return isShown ? (
    <BodyWithChanges {...{ item, classify }} />
  ) : (
    <Bullseye>
      {message}
      <Button onClick={() => setIsShown(true)} variant="link" isInline>
        {actionLabel}
      </Button>
    </Bullseye>
  );
};

const BodyWithChanges: React.FC<{
  item: Pick<Item, "entries" | "id">;
  classify?: Classify;
}> = ({ item, classify }) => (
  <DescriptionList isCompact>
    {item.entries.map((entry) => (
      <Entry
        key={entry.title}
        {...entry}
        classify={classify ? (title, to, from) => classify(item.id, title, to, from) : undefined}
      />
    ))}
  </DescriptionList>
);

const BodyWithMessage: React.FC<{ message: string }> = ({ message }) => (
  <Bullseye>{message}</Bullseye>
);
