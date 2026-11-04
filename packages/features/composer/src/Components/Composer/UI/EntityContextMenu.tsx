import React, { useContext, useEffect, useRef } from "react";
import { Menu, MenuContent, MenuItem, MenuList } from "@patternfly/react-core";
import { TimesIcon, TrashIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";
import { ComposerContext } from "../Data/Context";
import { canRemoveShape } from "../Data/Helpers";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";

interface Props {
  shape: ServiceEntityShape;
  x: number;
  y: number;
  onClose: () => void;
}

/**
 * The right-click menu of a shape. A new shape can be removed from the canvas: nothing is
 * sent to the orchestrator for it. An existing service or relation can be deleted
 * permanently: the order deletes it on deploy. When the relations require the shape,
 * the menu says it can't be removed.
 */
export const EntityContextMenu: React.FC<Props> = ({ shape, x, y, onClose }) => {
  const { canvasState, canvasActions, relationsDictionary, serviceCatalog } =
    useContext(ComposerContext);
  const menuRef = useRef<HTMLDivElement>(null);

  const canRemove = canRemoveShape(shape, canvasState, relationsDictionary, serviceCatalog);
  // Only allow "Remove from canvas" for new shapes to prevent unwanted side-effects
  const canRemoveFromCanvas = canRemove && shape.isNew;
  // Only core and relation entities can be permanently deleted. New shapes haven't been
  // persisted yet, so there's nothing to delete permanently.
  const canDelete =
    canRemove && !shape.isNew && (shape.entityType === "core" || shape.entityType === "relation");

  // Close on a click outside the menu, or on Escape
  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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

  const remove = (deletePermanently: boolean) => {
    canvasActions.removeShape(shape, deletePermanently);
    onClose();
  };

  return (
    <Menu
      ref={menuRef}
      aria-label={words("instanceComposer.halo.actions")(shape.getDisplayName())}
      className="entity-context-menu"
      style={{ position: "absolute", left: x, top: y, zIndex: 1000, minWidth: 220 }}
      data-testid="entity-context-menu"
    >
      <MenuContent>
        <MenuList>
          {canRemoveFromCanvas && (
            <MenuItem
              icon={<TimesIcon />}
              description={words("instanceComposer.contextMenu.remove.description")}
              onClick={() => remove(false)}
            >
              {words("instanceComposer.contextMenu.remove")}
            </MenuItem>
          )}
          {canDelete && (
            <MenuItem
              isDanger
              icon={<TrashIcon />}
              description={words("instanceComposer.contextMenu.delete.description")}
              onClick={() => remove(true)}
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
        </MenuList>
      </MenuContent>
    </Menu>
  );
};
