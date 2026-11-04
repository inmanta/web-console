import React, { useContext, useState } from "react";
import { AngleDoubleDownIcon, AngleDownIcon, AngleUpIcon, LinkIcon } from "@patternfly/react-icons";
import { Handle, Node, NodeProps, Position, useStore } from "@xyflow/react";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { ComposerContext } from "../Data/Context";
import {
  checkIfConnectionIsAllowed,
  collapseLayers,
  expandAllLayers,
  expandLayers,
} from "../Data/Helpers";
import { EntityShapeType, ServiceEntityShape } from "../Data/ServiceEntityShape";
import { SHAPE_WIDTH } from "../config";

export const HeaderColors: Record<EntityShapeType, string> = {
  core: "var(--pf-t--color--yellow--30)",
  embedded: "var(--pf-t--color--blue--50)",
  relation: "var(--pf-t--color--purple--50)",
};

/**
 * What the canvas passes to a card: the shape, and what it derived from the canvas.
 */
export type EntityNodeData = {
  shape: ServiceEntityShape;
  validationMessages: string[];
  hiddenCount: number;
  hasLayers: boolean;
};

export type EntityNodeType = Node<EntityNodeData, "entity">;

/**
 * A shape on the canvas: a card with the entity name and its key attributes.
 * The selected card shows a toolbar above it to collapse or expand the layers below it,
 * and to drag a link to another entity. While a link is dragged, the cards it can connect
 * to light up, and the whole card is a drop target.
 */
export const EntityNode: React.FC<NodeProps<EntityNodeType>> = ({ id, data, selected }) => {
  const { canvasState, relationsDictionary, canvasActions, editable } = useContext(ComposerContext);
  // Only the id of the card a link is dragged from: a wider selection would re-render
  // every card on each pointer move.
  const linkSourceId = useStore((state) =>
    state.connection.inProgress ? state.connection.fromNode.id : null
  );
  const [isHovered, setIsHovered] = useState(false);
  const { shape, validationMessages, hiddenCount, hasLayers } = data;
  const displayName = shape.getDisplayName();
  const attributes = shape.getDisplayAttributes();

  const fromShape = linkSourceId ? canvasState.get(linkSourceId) : undefined;
  const isLinkSource = linkSourceId === id;
  const isLinkTarget =
    !!fromShape &&
    !isLinkSource &&
    checkIfConnectionIsAllowed(fromShape, shape, relationsDictionary);

  const toggleLabel = shape.isLayersCollapsed
    ? words("instanceComposer.halo.expandLayers")
    : words("instanceComposer.halo.collapseLayers");

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

  const classNames = [
    selected && "is-selected",
    validationMessages.length > 0 && "is-invalid",
    isLinkTarget && "is-link-target",
    linkSourceId && !isLinkTarget && !isLinkSource && "is-dimmed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <NodeWrapper className={classNames}>
      <Toolbar
        className="nodrag nopan"
        role="toolbar"
        aria-label={words("instanceComposer.halo.actions")(displayName)}
        aria-hidden={!selected}
      >
        {hasLayers && (
          <>
            <button
              type="button"
              onClick={toggleLayers}
              aria-label={toggleLabel}
              title={toggleLabel}
            >
              {shape.isLayersCollapsed ? <AngleDownIcon /> : <AngleUpIcon />}
            </button>
            <button
              type="button"
              onClick={expandAll}
              aria-label={words("instanceComposer.halo.expandAllLayers")}
              title={words("instanceComposer.halo.expandAllLayers")}
            >
              <AngleDoubleDownIcon />
            </button>
          </>
        )}
        {editable && (
          <Handle
            id="link"
            type="source"
            position={Position.Top}
            className="link-handle"
            aria-label={words("instanceComposer.halo.link")}
            title={words("instanceComposer.halo.link")}
          >
            <LinkIcon />
          </Handle>
        )}
      </Toolbar>
      <Card
        className="entity-card"
        data-testid={`entity-${displayName}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Header
          $color={HeaderColors[shape.entityType]}
          $darkText={shape.entityType === "core"}
          data-testid={`header-${displayName}`}
        >
          <span className="name" title={displayName}>
            {displayName}
          </span>
          {hiddenCount > 0 && (
            <span className="hidden-count">
              {words("instanceComposer.hiddenLayers")(hiddenCount)}
            </span>
          )}
        </Header>
        {attributes.length > 0 && (
          <Attributes>
            {attributes.map(({ name, value }) => (
              <React.Fragment key={name}>
                <dt title={name}>{name}</dt>
                <dd title={value}>{value || "—"}</dd>
              </React.Fragment>
            ))}
          </Attributes>
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
      {isHovered && validationMessages.length > 0 && !linkSourceId && (
        <ValidationTooltip role="tooltip">
          {validationMessages.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </ValidationTooltip>
      )}
    </NodeWrapper>
  );
};

const NodeWrapper = styled.div`
  position: relative;
  width: ${SHAPE_WIDTH}px;

  // Dashed selection ring, a few pixels out from the card.
  &.is-selected::after {
    content: "";
    position: absolute;
    inset: -6px;
    border: 1px dashed var(--pf-t--global--border--color--brand--default);
    border-radius: calc(var(--pf-t--global--border--radius--small) + 6px);
    pointer-events: none;
  }

  &.is-invalid .entity-card {
    box-shadow:
      0 0 0 3px var(--pf-t--global--border--color--status--danger--default),
      var(--pf-t--global--box-shadow--sm);
  }

  &.is-link-target .entity-card {
    box-shadow:
      0 0 0 6px var(--pf-t--global--border--color--status--success--default),
      var(--pf-t--global--box-shadow--sm);
  }

  &.is-dimmed {
    opacity: 0.6;
  }

  // Above the toolbar of the selected card
  &.is-selected > [role="tooltip"] {
    bottom: calc(100% + 60px);
  }

  &:not(.is-selected) > [role="toolbar"] {
    visibility: hidden;
    pointer-events: none;
  }
`;

const Card = styled.div`
  position: relative;
  border-radius: var(--pf-t--global--border--radius--small);
  background: var(--pf-t--global--background--color--primary--default);
  box-shadow: var(--pf-t--global--box-shadow--sm);
  overflow: hidden;
  color: var(--pf-t--global--text--color--regular);
  cursor: grab;

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

const Header = styled.div<{ $color: string; $darkText: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-t--global--spacer--sm);
  padding: var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md);
  background: ${({ $color }) => $color};
  color: ${({ $darkText }) =>
    $darkText ? "var(--pf-t--color--gray--95)" : "var(--pf-t--color--white)"};
  font-weight: var(--pf-t--global--font--weight--body--bold);

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hidden-count {
    flex: none;
    padding: 0 var(--pf-t--global--spacer--sm);
    border-radius: var(--pf-t--global--border--radius--pill);
    background: var(--pf-t--global--background--color--primary--default);
    color: var(--pf-t--global--text--color--regular);
    font-size: var(--pf-t--global--font--size--body--sm);
    font-weight: var(--pf-t--global--font--weight--body--default);
  }
`;

const Attributes = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  row-gap: var(--pf-t--global--spacer--xs);
  column-gap: var(--pf-t--global--spacer--sm);
  margin: 0;
  padding: var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md);
  font-family: var(--pf-t--global--font--family--mono);
  font-size: var(--pf-t--global--font--size--body--sm);

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
`;

const Toolbar = styled.div`
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  display: flex;
  gap: var(--pf-t--global--spacer--xs);
  padding: var(--pf-t--global--spacer--xs);
  border-radius: var(--pf-t--global--border--radius--small);
  background: var(--pf-t--global--background--color--floating--default);
  box-shadow: var(--pf-t--global--box-shadow--md);
  cursor: default;

  // The link action is the handle a link is dragged from.
  .link-handle {
    position: static;
    transform: none;
    border: 0;
    border-radius: var(--pf-t--global--border--radius--small);
  }

  .link-handle,
  button {
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
    cursor: pointer;

    &:hover {
      background: var(--pf-t--global--background--color--primary--hover);
    }
  }

  .link-handle {
    cursor: grab;

    svg {
      pointer-events: none;
    }
  }
`;

const ValidationTooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 0;
  width: max-content;
  max-width: 300px;
  padding: var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md);
  border-radius: var(--pf-t--global--border--radius--small);
  background: var(--pf-t--global--background--color--inverse--default);
  color: var(--pf-t--global--text--color--inverse);
  font-size: var(--pf-t--global--font--size--body--default);
  box-shadow: var(--pf-t--global--box-shadow--md);
  pointer-events: none;
  z-index: 1;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 24px;
    border: 6px solid transparent;
    border-top-color: var(--pf-t--global--background--color--inverse--default);
  }
`;
