import React, { useContext } from "react";
import { Button, Icon } from "@patternfly/react-core";
import { TimesIcon } from "@patternfly/react-icons/dist/esm/icons/times-icon";
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  InternalNode,
  Position,
  useInternalNode,
} from "@xyflow/react";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { ComposerContext } from "../Data/Context";
import {
  canRemoveLink,
  CardBox,
  CardSide,
  getLinkAnchors,
  getShapeName,
  LayoutAxis,
} from "../Data/Helpers";

export type RelationEdgeType = Edge<
  {
    isActive: boolean;

    /** The direction the canvas is laid out in, which decides the sides the line joins. */
    layoutAxis: LayoutAxis;

    /** Removes the relation, keeping the focus in the canvas. */
    onRemove: () => void;
  },
  "relation"
>;

const positions: Record<CardSide, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

/**
 * Where a card is on the canvas and how big it is, as React Flow last measured it.
 */
const getCardBox = (node: InternalNode): CardBox => ({
  x: node.internals.positionAbsolute.x,
  y: node.internals.positionAbsolute.y,
  width: node.measured.width ?? 0,
  height: node.measured.height ?? 0,
});

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
  const { canvasState, relationsDictionary, serviceCatalog, editable } =
    useContext(ComposerContext);
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const sourceShape = canvasState.get(source);
  const targetShape = canvasState.get(target);

  if (!sourceNode || !targetNode || !sourceShape || !targetShape) {
    return null;
  }

  // A curve rather than right angles: lines that leave the same card spread out right away
  // instead of sharing a segment, so each one can be followed to its end.
  const [from, to] = getLinkAnchors(
    getCardBox(sourceNode),
    getCardBox(targetNode),
    data?.layoutAxis ?? "horizontal"
  );
  const [path, labelX, labelY] = getBezierPath({
    sourceX: from.x,
    sourceY: from.y,
    sourcePosition: positions[from.side],
    targetX: to.x,
    targetY: to.y,
    targetPosition: positions[to.side],
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
          <RemoveButtonPosition
            className="nodrag nopan"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            <Button
              variant="plain"
              size="sm"
              icon={
                <Icon status="danger">
                  <TimesIcon />
                </Icon>
              }
              aria-label={words("instanceComposer.link.remove")(
                getShapeName(sourceShape),
                getShapeName(targetShape)
              )}
              onClick={data.onRemove}
            />
          </RemoveButtonPosition>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Puts the remove button on the middle of the line, on a background so the line doesn't run
// through it.
const RemoveButtonPosition = styled.div`
  position: absolute;
  border-radius: 50%;
  background: var(--pf-t--global--background--color--primary--default);
  pointer-events: all;
`;
