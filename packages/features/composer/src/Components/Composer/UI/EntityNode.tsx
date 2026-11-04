import React, { useContext, useState } from "react";
import {
  AngleDoubleDownIcon,
  AngleDownIcon,
  AngleUpIcon,
  CubeIcon,
  ExclamationCircleIcon,
  LayerGroupIcon,
  LinkIcon,
  LockIcon,
  PuzzlePieceIcon,
  ServerIcon,
} from "@patternfly/react-icons";
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

const KindIcons: Record<EntityShapeType, React.ComponentType> = {
  core: CubeIcon,
  embedded: PuzzlePieceIcon,
  relation: ServerIcon,
};

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
 */
export const EntityNode: React.FC<NodeProps<EntityNodeType>> = ({ id, data, selected }) => {
  const { canvasState, relationsDictionary, canvasActions, editable } = useContext(ComposerContext);
  // Only the id of the card a link is dragged from: a wider selection would re-render
  // every card on each pointer move.
  const linkSourceId = useStore((state) =>
    state.connection.inProgress ? state.connection.fromNode.id : null
  );
  const [isHovered, setIsHovered] = useState(false);
  const { shape, validationMessages, hiddenCount, hasLayers, relationCount } = data;
  const displayName = shape.getDisplayName();
  const identity = shape.getIdentity();
  // The identity is the card's title, so it isn't listed again below it.
  const attributes = shape.getDisplayAttributes().filter(({ name }) => name !== identity?.name);
  const isReadOnly = shape.entityType === "relation" && !shape.isNew;
  const KindIcon = KindIcons[shape.entityType];

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
    hiddenCount > 0 && "is-collapsed",
    isLinkTarget && "is-link-target",
    linkSourceId && !isLinkTarget && !isLinkSource && "is-dimmed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <NodeWrapper
      className={classNames}
      style={{ "--entity-accent": HeaderColors[shape.entityType] } as React.CSSProperties}
    >
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
        <header>
          <span className="kind-icon" aria-hidden>
            <KindIcon />
          </span>
          <div className="heading">
            <span className="kind" data-testid={`header-${displayName}`} title={displayName}>
              {words(`instanceComposer.label.${shape.entityType}`)}
              {identity && ` · ${displayName}`}
            </span>
            {/* Named by its identity; an entity without one goes by its type. */}
            <span
              className={`title ${identity && !identity.value ? "is-placeholder" : ""}`}
              title={identity ? identity.value || undefined : displayName}
            >
              {identity ? identity.value || words("instanceComposer.card.unnamed") : displayName}
            </span>
          </div>
          <span className="status">
            {validationMessages.length > 0 && (
              <span
                className="issues"
                aria-label={words("instanceComposer.card.issues")(validationMessages.length)}
              >
                <ExclamationCircleIcon />
                {validationMessages.length}
              </span>
            )}
            {shape.isNew && <span className="pill">{words("instanceComposer.label.new")}</span>}
            {isReadOnly && (
              <span
                className="read-only"
                title={words("instanceComposer.card.readOnly")}
                aria-label={words("instanceComposer.card.readOnly")}
              >
                <LockIcon />
              </span>
            )}
          </span>
        </header>
        {attributes.length > 0 && (
          <dl>
            {attributes.map(({ name, value }) => (
              <React.Fragment key={name}>
                <dt title={name}>{name}</dt>
                <dd title={value} className={value ? "" : "is-placeholder"}>
                  {value || words("instanceComposer.card.notSet")}
                </dd>
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
  --entity-ring: transparent;
  position: relative;
  width: ${SHAPE_WIDTH}px;
  transition: opacity 150ms ease;

  &.is-invalid {
    --entity-ring: var(--pf-t--global--border--color--status--danger--default);
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

  // Collapsed layers: the cards hidden below peek out like a stack.
  .is-collapsed & {
    overflow: visible;
    box-shadow:
      0 0 0 2px var(--entity-ring),
      5px 5px 0 -1px var(--pf-t--global--background--color--primary--default),
      5px 5px 0 0 var(--pf-t--global--border--color--default),
      10px 10px 0 -1px var(--pf-t--global--background--color--primary--default),
      10px 10px 0 0 var(--pf-t--global--border--color--default);
  }

  .is-collapsed &::before {
    border-radius: var(--pf-t--global--border--radius--medium) 0 0
      var(--pf-t--global--border--radius--medium);
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
    background: color-mix(in srgb, var(--entity-accent) 18%, transparent);
    color: color-mix(in srgb, var(--entity-accent) 70%, var(--pf-t--global--text--color--regular));
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

  .issues {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    color: var(--pf-t--global--icon--color--status--danger--default);
    font-size: var(--pf-t--global--font--size--body--sm);
    font-weight: var(--pf-t--global--font--weight--body--bold);
  }

  .pill {
    padding: 0 var(--pf-t--global--spacer--sm);
    border: 1px solid var(--pf-t--global--border--color--brand--default);
    border-radius: var(--pf-t--global--border--radius--pill);
    color: var(--pf-t--global--text--color--brand--default);
    font-size: var(--pf-t--global--font--size--body--sm);
    line-height: 18px;
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
