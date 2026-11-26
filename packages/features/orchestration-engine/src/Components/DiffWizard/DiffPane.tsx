import React, { useState } from "react";
import {
  Button,
  Content,
  Divider,
  DrawerActions,
  DrawerHead,
  Flex,
  FlexItem,
  Title,
  Truncate,
} from "@patternfly/react-core";
import { AngleLeftIcon, AngleRightIcon } from "@patternfly/react-icons";
import { InnerScrollContainer } from "@patternfly/react-table";
import { words } from "@inmanta/web-console-core";
import { ClipboardCopyButton } from "@inmanta/web-console-ui/Components/ClipboardCopyButton";
import { ResourceLink } from "@inmanta/web-console-ui/Components/ResourceLink";
import { DiffStatusLabel } from "./DiffStatusLabel";
import { ResourceDiff } from "./ResourceDiff";
import { getAttributeValueOrId } from "./helpers";
import { DiffSideLabels, Item } from "./types";

interface Props extends DiffSideLabels {
  item: Item;
  previousResourceId: string | null;
  nextResourceId: string | null;
  onSelect: (resourceId: string) => void;
}

/**
 * The diff of the selected resource, under a header with its status, the value of its id,
 * "Previous" and "Next" to step through the resource list, and its full id with a copy button
 * and a link to the resource. The header stays in place and the diff scrolls under it, with the
 * header of its attribute table sticking to the top.
 *
 * @props {Props} props - The component props
 *  @prop {Item} item - The selected resource and its changes
 *  @prop {string | null} previousResourceId - The id of the resource above it in the list, null for the first
 *  @prop {string | null} nextResourceId - The id of the resource below it in the list, null for the last
 *  @prop {(resourceId: string) => void} onSelect - Called with the id of the resource to show
 *  @prop {string} fromLabel - The display text of the side the diff starts from, e.g. "Current state"
 *  @prop {string} toLabel - The display text of the side the diff goes to, e.g. "v412"
 *
 * @returns {React.FC<Props>} The diff pane
 */
const DiffPaneView: React.FC<Props> = ({
  item,
  previousResourceId,
  nextResourceId,
  onSelect,
  fromLabel,
  toLabel,
}) => {
  const idValue = getAttributeValueOrId(item.id);

  return (
    <>
      <DrawerHead>
        <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
          <Flex
            gap={{ default: "gapMd" }}
            alignItems={{ default: "alignItemsCenter" }}
            flexWrap={{ default: "nowrap" }}
          >
            <FlexItem flex={{ default: "flexNone" }}>
              <DiffStatusLabel status={item.status} />
            </FlexItem>
            <Title headingLevel="h2" size="lg" style={{ minWidth: 0 }}>
              <Truncate content={idValue} />
            </Title>
          </Flex>
          <Flex
            gap={{ default: "gapSm" }}
            alignItems={{ default: "alignItemsCenter" }}
            flexWrap={{ default: "nowrap" }}
          >
            {/* In a flex item, so the text has no bottom margin and lines up with the link. */}
            <FlexItem style={{ minWidth: 0 }}>
              <Content component="small">
                <Truncate content={item.id} />
              </Content>
            </FlexItem>
            <ClipboardCopyButton value={item.id} hasNoPadding />
            <FlexItem flex={{ default: "flexNone" }}>
              <ResourceLink
                resourceId={item.id}
                linkText={words("desiredState.resourceDetails.title")}
                isInline
              />
            </FlexItem>
          </Flex>
        </Flex>
        <DrawerActions>
          <Flex gap={{ default: "gapMd" }} flexWrap={{ default: "nowrap" }}>
            <Button
              variant="link"
              isInline
              icon={<AngleLeftIcon />}
              isAriaDisabled={previousResourceId === null}
              onClick={() => {
                if (previousResourceId !== null) {
                  onSelect(previousResourceId);
                }
              }}
            >
              {words("previous")}
            </Button>
            <Button
              variant="link"
              isInline
              icon={<AngleRightIcon />}
              iconPosition="end"
              isAriaDisabled={nextResourceId === null}
              onClick={() => {
                if (nextResourceId !== null) {
                  onSelect(nextResourceId);
                }
              }}
            >
              {words("next")}
            </Button>
          </Flex>
        </DrawerActions>
      </DrawerHead>
      <Divider />
      <ScrollingResourceDiff key={item.id} item={item} fromLabel={fromLabel} toLabel={toLabel} />
    </>
  );
};

/**
 * The diff of one resource in its own scroller, with the header of its attribute table stuck to
 * the top once it scrolls. Keyed by the resource, so a newly selected resource starts at the top.
 *
 * @props {Props} props - The component props
 *  @prop {Item} item - The selected resource and its changes
 *  @prop {string} fromLabel - The display text of the side the diff starts from
 *  @prop {string} toLabel - The display text of the side the diff goes to
 *
 * @returns {React.FC<DiffSideLabels & { item: Item }>} The scrolling diff
 */
const ScrollingResourceDiff: React.FC<DiffSideLabels & { item: Item }> = ({
  item,
  fromLabel,
  toLabel,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <InnerScrollContainer onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 0)}>
      <ResourceDiff
        item={item}
        fromLabel={fromLabel}
        toLabel={toLabel}
        isTableHeaderStuck={isScrolled}
      />
    </InnerScrollContainer>
  );
};

/**
 * The diff pane, skipped when the page re-renders with the same resource and neighbours, so a
 * poll doesn't redraw the diff.
 */
export const DiffPane = React.memo(DiffPaneView);
