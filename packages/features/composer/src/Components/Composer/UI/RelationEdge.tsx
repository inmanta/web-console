import React, { useContext } from "react";
import { TimesIcon } from "@patternfly/react-icons/dist/esm/icons/times-icon";
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  InternalNode,
  Position,
  useInternalNode,
} from "@xyflow/react";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { ComposerContext } from "../Data/Context";
import { canRemoveLink } from "../Data/Helpers";

export type RelationEdgeType = Edge<{ isActive: boolean }, "relation">;

interface Anchor {
  x: number;
  y: number;
  position: Position;
}

/**
 * Picks the sides of the two cards that face each other: left and right when the cards
 * are further apart horizontally than vertically, otherwise top and bottom.
 */
const getAnchors = (source: InternalNode, target: InternalNode): [Anchor, Anchor] => {
  const box = (node: InternalNode) => {
    const width = node.measured.width ?? 0;
    const height = node.measured.height ?? 0;

    return {
      width,
      height,
      x: node.internals.positionAbsolute.x + width / 2,
      y: node.internals.positionAbsolute.y + height / 2,
    };
  };
  const from = box(source);
  const to = box(target);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const horizontalGap = Math.abs(dx) - (from.width + to.width) / 2;
  const verticalGap = Math.abs(dy) - (from.height + to.height) / 2;

  if (horizontalGap >= verticalGap) {
    const towards = dx >= 0 ? 1 : -1;

    return [
      {
        x: from.x + (towards * from.width) / 2,
        y: from.y,
        position: towards > 0 ? Position.Right : Position.Left,
      },
      {
        x: to.x - (towards * to.width) / 2,
        y: to.y,
        position: towards > 0 ? Position.Left : Position.Right,
      },
    ];
  }

  const towards = dy >= 0 ? 1 : -1;

  return [
    {
      x: from.x,
      y: from.y + (towards * from.height) / 2,
      position: towards > 0 ? Position.Bottom : Position.Top,
    },
    {
      x: to.x,
      y: to.y - (towards * to.height) / 2,
      position: towards > 0 ? Position.Top : Position.Bottom,
    },
  ];
};

/**
 * The line between two connected shapes, from parent to child. When it is hovered or
 * selected on an editable canvas, it offers to remove the relation, if the relation
 * allows that.
 */
export const RelationEdge: React.FC<EdgeProps<RelationEdgeType>> = ({
  id,
  source,
  target,
  data,
}) => {
  const { canvasState, canvasActions, relationsDictionary, serviceCatalog, editable } =
    useContext(ComposerContext);
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const sourceShape = canvasState.get(source);
  const targetShape = canvasState.get(target);

  if (!sourceNode || !targetNode || !sourceShape || !targetShape) {
    return null;
  }

  const [from, to] = getAnchors(sourceNode, targetNode);
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX: from.x,
    sourceY: from.y,
    sourcePosition: from.position,
    targetX: to.x,
    targetY: to.y,
    targetPosition: to.position,
    borderRadius: 8,
  });

  const canRemove =
    editable &&
    data?.isActive &&
    canRemoveLink(sourceShape, targetShape, canvasState, relationsDictionary, serviceCatalog);

  return (
    <>
      <BaseEdge id={id} path={path} interactionWidth={16} className="relation-edge" />
      <circle cx={to.x} cy={to.y} r={3} className="relation-edge-end" />
      {canRemove && (
        <EdgeLabelRenderer>
          <RemoveButton
            type="button"
            className="nodrag nopan"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            aria-label={words("instanceComposer.link.remove")(
              sourceShape.getDisplayName(),
              targetShape.getDisplayName()
            )}
            onClick={() => canvasActions.disconnectShapes(sourceShape, targetShape)}
          >
            <TimesIcon />
          </RemoveButton>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const RemoveButton = styled.button`
  position: absolute;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 2px solid var(--pf-t--global--icon--color--status--danger--default);
  border-radius: 50%;
  background: var(--pf-t--global--background--color--primary--default);
  color: var(--pf-t--global--icon--color--status--danger--default);
  font-size: 10px;
  cursor: pointer;
  pointer-events: all;
`;
