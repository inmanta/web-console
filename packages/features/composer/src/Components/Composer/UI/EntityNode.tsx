import React, { useContext, useRef, useState } from "react";
import { Button, Icon, Label, Tooltip } from "@patternfly/react-core";
import { AngleDoubleDownIcon } from "@patternfly/react-icons/dist/esm/icons/angle-double-down-icon";
import { AngleDownIcon } from "@patternfly/react-icons/dist/esm/icons/angle-down-icon";
import { AngleUpIcon } from "@patternfly/react-icons/dist/esm/icons/angle-up-icon";
import { ExclamationCircleIcon } from "@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon";
import { LayerGroupIcon } from "@patternfly/react-icons/dist/esm/icons/layer-group-icon";
import { LinkIcon } from "@patternfly/react-icons/dist/esm/icons/link-icon";
import { LockIcon } from "@patternfly/react-icons/dist/esm/icons/lock-icon";
import { Handle, Node, NodeProps, Position, useConnectionStore } from "@xyflow/react";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { InstanceStateLabel } from "@inmanta/web-console-ui/Components/InstanceState";
import { ComposerContext } from "../Data/Context";
import {
  checkIfConnectionIsAllowed,
  collapseLayers,
  expandAllLayers,
  expandLayers,
  getShapeName,
  isReadOnlyShape,
} from "../Data/Helpers";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { SHAPE_WIDTH } from "../config";
import { EntityIcon } from "./EntityIcon";
import { OverflowText, OverflowTooltipPlacement } from "./OverflowText";
import { entityColorVariables } from "./entityColors";

/**
 * What the canvas passes to a card: the shape, and what it derived from the canvas.
 */
export type EntityNodeData = {
  shape: ServiceEntityShape;
  validationMessages: string[];
  hiddenCount: number;
  hasLayers: boolean;
  relationCount: number;
};

export type EntityNodeType = Node<EntityNodeData, "entity">;

/**
 * A shape on the canvas. The card names the instance by its identity, says what kind of
 * entity it is, and lists its key attributes. When its layers are collapsed, it looks like a
 * stack, and a footer counts what is hidden below it.
 *
 * The selected card shows a toolbar above it to collapse or expand the layers below it,
 * and to drag a link to another entity. While a link is dragged, the cards it can connect
 * to light up, and the whole card is a drop target.
 *
 * An invalid card counts its problems in a button: pointing at the card or focusing the button
 * lists them in a tooltip, and the button is described by the list for screen readers.
 */
export const EntityNode: React.FC<NodeProps<EntityNodeType>> = ({ id, data, selected }) => {
  const { canvasState, relationsDictionary, canvasActions, editable } = useContext(ComposerContext);
  // Only the id of the card a link is dragged from: a wider selection would re-render
  // every card on each pointer move.
  const linkSourceId = useConnectionStore((state) =>
    state.connection.inProgress ? state.connection.fromNode.id : null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isIssuesFocused, setIsIssuesFocused] = useState(false);
  const [isTextTooltipVisible, setIsTextTooltipVisible] = useState(false);
  const issuesRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { shape, validationMessages, hiddenCount, hasLayers, relationCount } = data;
  const displayName = shape.getDisplayName();
  // Test ids go by a service's technical name, so tests don't depend on the model's titles.
  const testName = shape.getTechnicalName() ?? displayName;
  const identity = shape.getIdentity();
  // The identity is the card's title, so it isn't listed again below it.
  const attributes = shape.getDisplayAttributes().filter(({ name }) => name !== identity?.name);
  const isReadOnly = isReadOnlyShape(shape);
  // Only offered when the model lets the entity be linked at all; read-only cards keep it.
  const canLink = editable && (isReadOnly || shape.canHaveConnections());
  const hasActions = hasLayers || canLink;

  const fromShape = linkSourceId ? canvasState.get(linkSourceId) : undefined;
  const isLinkSource = linkSourceId === id;
  const isLinkTarget =
    !!fromShape &&
    !isLinkSource &&
    checkIfConnectionIsAllowed(fromShape, shape, relationsDictionary, canvasState);

  const kindLabel = words(`instanceComposer.label.${shape.entityType}`);
  const kindText = identity
    ? words("instanceComposer.label.withName")(kindLabel, displayName)
    : kindLabel;
  const titleText = identity
    ? identity.value || words("instanceComposer.card.unnamed")
    : displayName;

  const toggleLabel = shape.isLayersCollapsed
    ? words("instanceComposer.card.toolbar.expandLayers")
    : words("instanceComposer.card.toolbar.collapseLayers");

  const toggleLayers = () => {
    if (shape.isLayersCollapsed) {
      expandLayers(canvasState, shape);
    } else {
      collapseLayers(canvasState, shape);
    }
    canvasActions.refresh();
  };

  const expandAll = () => {
    expandAllLayers(canvasState, shape);
    canvasActions.refresh();
  };

  const messagesId = `entity-${id}-problems`;
  // A card staged to be deleted only orders its delete, so its problems don't show
  const showsProblems = validationMessages.length > 0 && !shape.isMarkedForDeletion;
  // Tooltips sit above or below the whole card so they never cover the card's content; a
  // selected card has its toolbar above it, so there they go below.
  const tooltipPlacement: OverflowTooltipPlacement = {
    anchorRef: cardRef,
    position: selected ? "bottom" : "top",
    flipBehavior: selected ? ["bottom", "top"] : ["top", "bottom"],
  };
  const textTooltipProps = {
    tooltipPlacement,
    onTooltipVisibleChange: setIsTextTooltipVisible,
  };
  // The problems take the same place as a cut-short text's tooltip, so they make way for it.
  const showMessages =
    showsProblems && !linkSourceId && !isTextTooltipVisible && (isHovered || isIssuesFocused);

  const classNames = [
    selected && "is-selected",
    validationMessages.length > 0 && !shape.isMarkedForDeletion && "is-invalid",
    shape.isMarkedForDeletion && "is-marked-for-deletion",
    hiddenCount > 0 && "is-collapsed",
    isLinkTarget && "is-link-target",
    linkSourceId && !isLinkTarget && !isLinkSource && "is-dimmed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <NodeWrapper
      ref={cardRef}
      className={classNames}
      style={entityColorVariables(shape.entityType)}
    >
      {hasActions && (
        <Toolbar
          className="nodrag nopan"
          role="toolbar"
          aria-label={words("instanceComposer.card.toolbar.actions")(getShapeName(shape))}
          aria-hidden={!selected}
        >
          {hasLayers && (
            <>
              <Tooltip content={toggleLabel} aria="none">
                <Button
                  variant="plain"
                  icon={shape.isLayersCollapsed ? <AngleDownIcon /> : <AngleUpIcon />}
                  onClick={toggleLayers}
                  aria-label={toggleLabel}
                />
              </Tooltip>
              <Tooltip content={words("instanceComposer.card.toolbar.expandAllLayers")} aria="none">
                <Button
                  variant="plain"
                  icon={<AngleDoubleDownIcon />}
                  onClick={expandAll}
                  aria-label={words("instanceComposer.card.toolbar.expandAllLayers")}
                />
              </Tooltip>
            </>
          )}
          {canLink && (
            <Tooltip content={words("instanceComposer.card.toolbar.link")} aria="none">
              <Handle
                id="link"
                type="source"
                position={Position.Top}
                className="link-handle"
                aria-label={words("instanceComposer.card.toolbar.link")}
              >
                <LinkIcon />
              </Handle>
            </Tooltip>
          )}
        </Toolbar>
      )}
      <Card
        className="entity-card"
        data-testid={`entity-${testName}`}
        data-invalid={showsProblems}
        data-marked-for-deletion={shape.isMarkedForDeletion}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <header>
          <span className="kind-icon" aria-hidden>
            <EntityIcon serviceModel={shape.serviceModel} />
          </span>
          <div className="heading">
            <OverflowText
              className="kind"
              data-testid={`header-${testName}`}
              text={kindText}
              {...textTooltipProps}
            />
            {/* Named by its identity; an entity without one goes by its type. */}
            <OverflowText
              className={`title ${identity && !identity.value ? "is-placeholder" : ""}`}
              text={titleText}
              {...textTooltipProps}
            />
          </div>
          <span className="status">
            {shape.isMarkedForDeletion && (
              <Label isCompact status="danger" variant="outline">
                {words("instanceComposer.card.markedForDeletion")}
              </Label>
            )}
            {showsProblems && (
              <Button
                ref={issuesRef}
                variant="plain"
                size="sm"
                className="issues"
                icon={
                  <Icon status="danger">
                    <ExclamationCircleIcon />
                  </Icon>
                }
                aria-label={words("instanceComposer.card.issues")(validationMessages.length)}
                aria-describedby={messagesId}
                onFocus={() => setIsIssuesFocused(true)}
                onBlur={() => setIsIssuesFocused(false)}
                onKeyDown={(event) => {
                  // Escape hides the list, without unselecting the card
                  if (event.key === "Escape" && showMessages) {
                    event.stopPropagation();
                    setIsIssuesFocused(false);
                    setIsHovered(false);
                  }
                }}
              >
                {validationMessages.length}
              </Button>
            )}
            {shape.instanceState && (
              <span data-testid={`entity-state-${testName}`}>
                <InstanceStateLabel {...shape.instanceState} isCompact />
              </span>
            )}
            {shape.isNew && (
              <Label isCompact variant="outline">
                {words("instanceComposer.label.new")}
              </Label>
            )}
            {isReadOnly && (
              <Tooltip content={words("instanceComposer.card.readOnly")} aria="none">
                <span
                  className="read-only"
                  role="img"
                  aria-label={words("instanceComposer.card.readOnly")}
                >
                  <LockIcon />
                </span>
              </Tooltip>
            )}
          </span>
        </header>
        {attributes.length > 0 && (
          <dl>
            {attributes.map(({ name, value }) => (
              <React.Fragment key={name}>
                <OverflowText component="dt" text={name} {...textTooltipProps} />
                <OverflowText
                  component="dd"
                  className={value ? "" : "is-placeholder"}
                  text={value || words("instanceComposer.card.notSet")}
                  {...textTooltipProps}
                />
              </React.Fragment>
            ))}
          </dl>
        )}
        {hiddenCount > 0 && (
          <footer>
            <span>
              <LinkIcon />
              {words("instanceComposer.card.relations")(relationCount)}
            </span>
            <span className="hidden-count">
              <LayerGroupIcon />
              {words("instanceComposer.hiddenLayers")(hiddenCount)}
            </span>
          </footer>
        )}
        {/* React Flow only draws a line from a card with a source handle; the link action is
            one only in the editor, so every card has this one for the lines to start from. */}
        <Handle
          type="source"
          position={Position.Right}
          className="entity-edge-handle"
          isConnectable={false}
        />
        <Handle
          type="target"
          position={Position.Left}
          className="entity-target-handle"
          isConnectableStart={false}
        />
      </Card>
      {showsProblems && (
        <>
          <ul id={messagesId} hidden>
            {validationMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          {/* The button is described by the list above, so the tooltip adds no description */}
          <Tooltip
            triggerRef={cardRef}
            trigger="manual"
            isVisible={showMessages}
            position={tooltipPlacement.position}
            flipBehavior={tooltipPlacement.flipBehavior}
            aria="none"
            content={validationMessages.map((message) => (
              <div key={message}>{message}</div>
            ))}
          />
        </>
      )}
    </NodeWrapper>
  );
};

const NodeWrapper = styled.div`
  --entity-ring: transparent;
  position: relative;
  width: ${SHAPE_WIDTH}px;
  transition: opacity 150ms ease;

  &.is-invalid {
    --entity-ring: var(--pf-t--global--border--color--status--danger--default);
  }

  // Staged to be deleted: a danger ring, with the attributes faded but the header readable,
  // so the user sees what the deploy will delete and can still undo it.
  &.is-marked-for-deletion {
    --entity-ring: var(--pf-t--global--border--color--status--danger--default);

    .entity-card > :is(dl, footer) {
      opacity: 0.55;
    }
  }

  &.is-selected {
    --entity-ring: var(--pf-t--global--border--color--brand--default);
  }

  &.is-link-target {
    --entity-ring: var(--pf-t--global--border--color--status--success--default);
  }

  &.is-dimmed {
    opacity: 0.45;
  }

  // Collapsed layers: the cards hidden below are tucked under this one like a stack, each a
  // little narrower and further down. They are drawn behind the card, so the card keeps its
  // own ring, shadow and clipped corners.
  &.is-collapsed {
    isolation: isolate;

    &::before,
    &::after {
      content: "";
      position: absolute;
      z-index: -1;
      top: 0;
      border: 1px solid
        color-mix(
          in srgb,
          var(--pf-t--global--border--color--default) 60%,
          var(--pf-t--global--text--color--subtle)
        );
      border-radius: var(--pf-t--global--border--radius--medium);
      background: var(--pf-t--global--background--color--primary--default);
    }

    &::before {
      inset-inline: 10px;
      bottom: -8px;
    }

    &::after {
      z-index: -2;
      inset-inline: 20px;
      bottom: -16px;
    }
  }

  &:not(.is-selected) > [role="toolbar"] {
    visibility: hidden;
    pointer-events: none;
  }
`;

const Card = styled.div`
  position: relative;
  overflow: hidden;
  border: 1px solid var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--medium);
  background: var(--pf-t--global--background--color--primary--default);
  box-shadow:
    0 0 0 2px var(--entity-ring),
    var(--pf-t--global--box-shadow--sm);
  color: var(--pf-t--global--text--color--regular);
  cursor: grab;
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;

  // The type's colour runs down the left edge.
  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: var(--entity-accent);
  }

  &:hover {
    box-shadow:
      0 0 0 2px var(--entity-ring),
      var(--pf-t--global--box-shadow--md);
  }

  .is-selected & {
    box-shadow:
      0 0 0 2px var(--entity-ring),
      0 0 0 6px color-mix(in srgb, var(--entity-ring) 20%, transparent),
      var(--pf-t--global--box-shadow--md);
  }

  .is-link-target & {
    box-shadow:
      0 0 0 2px var(--entity-ring),
      0 0 0 8px color-mix(in srgb, var(--entity-ring) 25%, transparent);
  }

  header {
    display: flex;
    align-items: flex-start;
    gap: var(--pf-t--global--spacer--sm);
    padding: var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)
      var(--pf-t--global--spacer--sm) calc(var(--pf-t--global--spacer--md) + 4px);
  }

  .kind-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    margin-top: 2px;
    border-radius: var(--pf-t--global--border--radius--small);
    background: var(--entity-icon-background);
    color: var(--entity-icon-color);
  }

  .heading {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .kind {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--pf-t--global--text--color--subtle);
    font-size: var(--pf-t--global--font--size--body--sm);
  }

  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--pf-t--global--font--family--heading);
    font-size: var(--pf-t--global--font--size--heading--h5);
    font-weight: var(--pf-t--global--font--weight--heading--default);
    line-height: 1.3;
  }

  .is-placeholder {
    color: var(--pf-t--global--text--color--subtle);
    font-style: italic;
    font-weight: var(--pf-t--global--font--weight--body--default);
  }

  .status {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--pf-t--global--spacer--xs);
    color: var(--pf-t--global--icon--color--subtle);
  }

  dl {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    row-gap: var(--pf-t--global--spacer--xs);
    column-gap: var(--pf-t--global--spacer--sm);
    margin: 0;
    padding: var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)
      var(--pf-t--global--spacer--sm) calc(var(--pf-t--global--spacer--md) + 4px);
    border-top: 1px solid var(--pf-t--global--border--color--default);
    font-size: var(--pf-t--global--font--size--body--sm);
  }

  dt,
  dd {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  dt {
    color: var(--pf-t--global--text--color--subtle);
  }

  dd {
    font-family: var(--pf-t--global--font--family--mono);
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--pf-t--global--spacer--sm);
    padding: var(--pf-t--global--spacer--xs) var(--pf-t--global--spacer--md)
      var(--pf-t--global--spacer--xs) calc(var(--pf-t--global--spacer--md) + 4px);
    border-top: 1px solid var(--pf-t--global--border--color--default);
    background: var(--pf-t--global--background--color--secondary--default);
    color: var(--pf-t--global--text--color--subtle);
    font-size: var(--pf-t--global--font--size--body--sm);

    span {
      display: inline-flex;
      align-items: center;
      gap: var(--pf-t--global--spacer--xs);
    }
  }

  .hidden-count {
    margin-left: auto;
    padding: 0 var(--pf-t--global--spacer--sm);
    border-radius: var(--pf-t--global--border--radius--pill);
    background: var(--pf-t--global--color--brand--default);
    color: var(--pf-t--global--text--color--on-brand--default);
  }

  .entity-edge-handle {
    opacity: 0;
    pointer-events: none;
  }

  // The whole card is the drop target of a link, but only while a link is dragged,
  // so it doesn't get in the way of clicking and moving the card.
  .entity-target-handle {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: none;
    border: 0;
    border-radius: 0;
    opacity: 0;
    pointer-events: none;
  }
`;

const Toolbar = styled.div`
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  display: flex;
  gap: var(--pf-t--global--spacer--xs);
  padding: var(--pf-t--global--spacer--xs);
  border-radius: var(--pf-t--global--border--radius--medium);
  background: var(--pf-t--global--background--color--floating--default);
  box-shadow: var(--pf-t--global--box-shadow--md);
  cursor: default;

  // The link action is the handle a link is dragged from, so it can't be a PF button: it is
  // sized like the plain buttons next to it.
  .link-handle {
    position: static;
    transform: none;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    min-width: 0;
    min-height: 0;
    padding: 0;
    border: 0;
    border-radius: var(--pf-t--global--border--radius--small);
    background: transparent;
    color: var(--pf-t--global--icon--color--regular);
    cursor: grab;

    &:hover {
      background: var(--pf-t--global--background--color--primary--hover);
    }

    svg {
      pointer-events: none;
    }
  }
`;
