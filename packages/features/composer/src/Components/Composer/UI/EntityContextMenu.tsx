import React, { useContext, useEffect, useRef } from "react";
import { Menu, MenuContent, MenuItem, MenuList } from "@patternfly/react-core";
import { TimesIcon } from "@patternfly/react-icons/dist/esm/icons/times-icon";
import { TrashIcon } from "@patternfly/react-icons/dist/esm/icons/trash-icon";
import { UndoIcon } from "@patternfly/react-icons/dist/esm/icons/undo-icon";
import { words } from "@inmanta/web-console-core";
import { ComposerContext } from "../Data/Context";
import { canUndoDelete, getRemoveActions, getShapeName } from "../Data/Helpers";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";

interface Props {
  shape: ServiceEntityShape;
  x: number;
  y: number;

  /**
   * Closes the menu. After Escape or one of its actions, the focus goes back to the canvas
   * (restoreFocus); after a click outside it, the focus stays where the click put it.
   */
  onClose: (restoreFocus: boolean) => void;
}

/**
 * The menu of a shape, opened with a right-click, or with the Delete key when the selected shape
 * can't simply be removed. A new shape, or an existing instance other than the one being edited,
 * can be removed from the canvas: nothing is sent to the orchestrator for it. An existing
 * service or relation can be deleted permanently: the card stays on the canvas, marked, and the
 * order deletes the instance on deploy; the menu of a marked card undoes the delete, unless a
 * related instance has no room for it anymore (canUndoDelete). When the
 * relations require the shape, the menu says it can't be removed (getRemoveActions).
 */
export const EntityContextMenu: React.FC<Props> = ({ shape, x, y, onClose }) => {
  const { canvasState, canvasActions, relationsDictionary, serviceCatalog, serviceInstanceId } =
    useContext(ComposerContext);
  const menuRef = useRef<HTMLDivElement>(null);

  const { canRemoveFromCanvas, canDelete } = getRemoveActions(
    shape,
    canvasState,
    relationsDictionary,
    serviceCatalog,
    serviceInstanceId
  );
  const canUndo =
    shape.isMarkedForDeletion &&
    canUndoDelete(shape, canvasState, relationsDictionary, serviceCatalog);

  // Close on a click outside the menu, or on Escape
  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(true);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    menuRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus();

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const remove = () => {
    canvasActions.removeShape(shape);
    onClose(true);
  };

  const markForDeletion = (marked: boolean) => {
    canvasActions.markShapeForDeletion(shape, marked);
    onClose(true);
  };

  return (
    <Menu
      ref={menuRef}
      aria-label={words("instanceComposer.card.toolbar.actions")(getShapeName(shape))}
      className="entity-context-menu"
      style={{ position: "absolute", left: x, top: y, zIndex: 1000, minWidth: 220 }}
      data-testid="entity-context-menu"
    >
      <MenuContent>
        <MenuList>
          {shape.isMarkedForDeletion ? (
            <MenuItem
              icon={<UndoIcon />}
              isDisabled={!canUndo}
              description={words(
                canUndo
                  ? "instanceComposer.contextMenu.undoDelete.description"
                  : "instanceComposer.contextMenu.cannotUndoDelete.description"
              )}
              onClick={() => markForDeletion(false)}
            >
              {words("instanceComposer.contextMenu.undoDelete")}
            </MenuItem>
          ) : (
            <>
              {canRemoveFromCanvas && (
                <MenuItem
                  icon={<TimesIcon />}
                  description={words("instanceComposer.contextMenu.remove.description")}
                  onClick={remove}
                >
                  {words("instanceComposer.contextMenu.remove")}
                </MenuItem>
              )}
              {canDelete && (
                <MenuItem
                  isDanger
                  icon={<TrashIcon />}
                  description={words("instanceComposer.contextMenu.delete.description")}
                  onClick={() => markForDeletion(true)}
                >
                  {words("instanceComposer.contextMenu.delete")}
                </MenuItem>
              )}
              {!canRemoveFromCanvas && !canDelete && (
                <MenuItem
                  isDisabled
                  description={words("instanceComposer.contextMenu.cannotRemove.description")}
                >
                  {words("instanceComposer.contextMenu.cannotRemove.title")}
                </MenuItem>
              )}
            </>
          )}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};
