import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Flex,
  FlexItem,
  TextContent,
  Title,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { sanitizeAttributes } from "@/Data";
import { words } from "@/UI/words";
import { CanvasContext, InstanceComposerContext } from "../Context/Context";
import { updateServiceOrderItems } from "../helpers";
import { ActionEnum, EmbeddedEventEnum } from "../interfaces";
import { EntityForm } from "./EntityForm";

/**
 * `RightSidebar` is a React functional component that renders a sidebar for editing and removing entities.
 * The sidebar displays the details of the selected entity and provides options to edit or remove the entity.
 * The state of the sidebar is updated based on the selected entity and the user's interactions with the sidebar and/or composer's canvas.
 * When the user submits the edit form, the `onSave` callback is called with the updated attributes and the form state.
 * The user can also remove the entity by clicking the remove button, which triggers the `action:delete` event on the entity.
 *
 * The removal differs from deleting the instance:
 * Remove - removes the entity from the canvas only (does not delete the instance from the backend).
 * Delete - deletes the instance from the backend.
 *
 * Deleting a whole instance is not possible through composer, we can only delete embedded entities of the instance or remove the inter-service relation connections if the service model allows it.
 *
 * @returns {React.FC} The RightSidebar component.
 */
export const RightSidebar: React.FC = () => {
  const { cellToEdit, diagramHandlers, setServiceOrderItems, stencilState } =
    useContext(CanvasContext);
  const { mainService } = useContext(InstanceComposerContext);
  const [description, setDescription] = useState<string | null>(null);
  const [isAllowedToRemove, setIsAllowedToRemove] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [model, setModel] = useState<ServiceModel | null>(null);
  const [attributes, setAttributes] = useState<InstanceAttributeModel>({});

  /**
   * Handles the removal of a cell.
   *
   * If the cell to edit is not defined, the function returns early.
   * Triggers the delete action on the cell.
   * If the cell is embedded, dispatches a custom event to update the stencil.
   * If the cell is an inter-service relation entity, enables the Inventory Stencil Element for the instance.
   *
   * @returns {void}
   */
  const onRemove = (): void => {
    if (!cellToEdit) {
      return;
    }
    const { model } = cellToEdit;

    //logic of deleting cell stayed in the halo which triggers the event
    cellToEdit.trigger("action:delete");
    const isEmbedded = model.get("isEmbedded");

    if (isEmbedded) {
      //dispatch event instead of calling function directly from context
      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: {
            name: model.get("entityName"),
            action: EmbeddedEventEnum.REMOVE,
          },
        }),
      );
    }

    //stencilName is only available for inter-service relation entities
    const stencilName = model.get("stencilName");

    if (stencilName) {
      //enable Inventory Stencil element for inter-service relation instance
      const elements = [
        [`.${stencilName}_body`, "stencil_accent-disabled"],
        [`.${stencilName}_bodyTwo`, "stencil_body-disabled"],
        `.${stencilName}_text, 'stencil_text-disabled`,
      ];

      elements.forEach(([elementName, className]) => {
        const element = document.querySelector(elementName);

        if (element) {
          element.classList.remove(className);
        }
      });
    }
  };

  /**
   * Handles the edit action for the form.
   * Opens the form by setting the form open state to true.
   */
  const onEdit = (): void => {
    setIsFormOpen(true);
  };

  /**
   * Handles the cancel action for the form.
   * Closes the form by setting the form open state to false.
   */
  const onCancel = (): void => {
    setIsFormOpen(false);
  };

  /**
   * Handles the save action for the form.
   * Sanitizes the form attributes and updates the entity in the diagram.
   * Updates the service order items with the new shape and closes the form.
   *
   * @param {Field[]} fields - The fields of the form.
   * @param {InstanceAttributeModel} formState - The current state of the form.
   */
  const onSave = (fields: Field[], formState: InstanceAttributeModel) => {
    if (cellToEdit && diagramHandlers && model) {
      const sanitizedAttrs = sanitizeAttributes(fields, formState);

      if (cellToEdit) {
        const shape = diagramHandlers.editEntity(cellToEdit, model, formState);

        shape.set("sanitizedAttrs", sanitizedAttrs);

        setServiceOrderItems((prev) =>
          updateServiceOrderItems(shape, ActionEnum.UPDATE, prev),
        );
      }
    }
    setIsFormOpen(false);
  };

  useEffect(() => {
    if (isFormOpen) {
      setIsFormOpen(false); //as sidebar is always open, we need to close form when we click on another entity
    }

    if (!cellToEdit) {
      setDescription(mainService.description || null);

      return;
    }

    const { model } = cellToEdit;
    const serviceModel = model.get("serviceModel");
    const entityName = model.get("entityName");
    const instanceAttributes = model.get("instanceAttributes");

    if (serviceModel) {
      setDescription(serviceModel.description);
      setModel(serviceModel);
    }

    if (instanceAttributes) {
      setAttributes(instanceAttributes);
    }

    setIsAllowedToRemove(() => {
      const isCellCore = model.get("isCore");

      //children entities are not allowed to be removed, as well as rw embedded entities in the edit form
      const canBeRemoved = !model.get("cantBeRemoved");

      if (!stencilState) {
        return !isCellCore && canBeRemoved;
      }

      const entityState = stencilState[entityName];

      if (!entityState) {
        return !isCellCore && canBeRemoved;
      }

      const lowerLimit = entityState.min;

      const isLowerLimitReached =
        lowerLimit && entityState.current === lowerLimit;

      return !isCellCore && canBeRemoved && !isLowerLimitReached;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellToEdit]);

  return (
    <Wrapper>
      <StyledFlex
        direction={{ default: "column" }}
        spaceItems={{ default: "spaceItemsSm" }}
        justifyContent={{ default: "justifyContentSpaceBetween" }}
      >
        <Flex
          direction={{ default: "column" }}
          spaceItems={{ default: "spaceItemsSm" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <FlexItem alignSelf={{ default: "alignSelfCenter" }}>
            <Title headingLevel="h1">{words("details")}</Title>
          </FlexItem>
          {description && (
            <FlexItem>
              <TextContent aria-label="service-description">
                {description}
              </TextContent>
            </FlexItem>
          )}
        </Flex>
        {!!cellToEdit && !!model && (
          <EntityForm
            serviceModel={model}
            isEdited={cellToEdit.model.get("isInEditMode")}
            initialState={attributes}
            isForDisplay={!isFormOpen}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}

        {!isFormOpen && (
          <Flex justifyContent={{ default: "justifyContentCenter" }}>
            <FlexItem>
              <StyledButton
                variant="danger"
                width={200}
                onClick={onRemove}
                isDisabled={!isAllowedToRemove || !cellToEdit}
              >
                {words("remove")}
              </StyledButton>
            </FlexItem>
            <FlexItem>
              <StyledButton
                variant="primary"
                width={200}
                onClick={onEdit}
                isDisabled={
                  !cellToEdit || cellToEdit.model.get("isBlockedFromEditing")
                }
              >
                {words("edit")}
              </StyledButton>
            </FlexItem>
          </Flex>
        )}
      </StyledFlex>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 100%;
  width: 300px;
  position: absolute;
  z-index: 1px;
  top: 1px;
  right: 1px;
  background: var(--pf-v5-global--BackgroundColor--100);
  padding: 16px;
  filter: drop-shadow(
    -0.1rem 0.1rem 0.15rem var(--pf-v5-global--BackgroundColor--dark-transparent-200)
  );
  overflow: auto;
`;

export const StyledButton = styled(Button)`
  --pf-v5-c-button--PaddingTop: 0px;
  --pf-v5-c-button--PaddingBottom: 0px;
  width: 101px;
  height: 30px;
`;

const StyledFlex = styled(Flex)`
  min-height: 100%;
`;
