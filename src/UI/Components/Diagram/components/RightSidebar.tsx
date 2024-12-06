import React, { useContext, useEffect, useState } from "react";
import {
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Title,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { sanitizeAttributes } from "@/Data";
import { words } from "@/UI/words";
import { CanvasContext, InstanceComposerContext } from "../Context/Context";
import { dispatchUpdateStencil } from "../Context/dispatchers";
import { updateServiceOrderItems } from "../helpers";
import { ActionEnum, EventActionEnum } from "../interfaces";
import { toggleDisabledStencil } from "../stencil/helpers";
import { EntityForm } from "./EntityForm";

interface Props {
  editable: boolean;
}

/**
 * `RightSidebar` is a React functional component that renders a sidebar for editing and removing entities.
 * The sidebar displays the details of the selected entity and provides options to edit or remove the entity.
 * The state of the sidebar is updated based on the selected entity and the user's interactions with the sidebar and/or composer's canvas.
 * When the user submits the edit form, the `onSave` callback is called with the updated attributes and the form state.
 * The user can also remove the entity by clicking the remove button, which triggers the `action:delete` event on the entity.
 *
 * The removal of the entity has different end result based on the type of the entity:
 * - Core entity cannot be removed or deleted in the Composer.
 * - Embedded entities are removed from the canvas(if service model allows it), and will be erased from the service instance.
 * - Inter-service relation entities are removed from the canvas(if service model allows it), but won't be deleted from the environment.
 *
 * @props {Props} props - The properties passed to the component
 * @prop {boolean} editable - A flag indication if the composer is editable
 *
 * @returns {React.FC} The RightSidebar component.
 */
export const RightSidebar: React.FC<Props> = ({ editable }) => {
  const { cellToEdit, diagramHandlers, setServiceOrderItems, stencilState } =
    useContext(CanvasContext);
  const { mainService } = useContext(InstanceComposerContext);
  const [description, setDescription] = useState<string | null>(null);
  const [isRemovable, setIsRemovable] = useState(false);
  const [model, setModel] = useState<ServiceModel | null>(null);
  const [isInterServiceRelation, setIsInterServiceRelation] = useState(false);
  const [attributes, setAttributes] = useState<InstanceAttributeModel>({});

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

      const shape = diagramHandlers.editEntity(cellToEdit, model, formState);

      shape.set("sanitizedAttrs", sanitizedAttrs);

      setServiceOrderItems((prev) =>
        updateServiceOrderItems(shape, ActionEnum.UPDATE, prev),
      );
    }
  };

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
    const isEmbeddedEntity = model.get("isEmbeddedEntity");

    if (isEmbeddedEntity) {
      //dispatch event instead of calling function directly from context
      dispatchUpdateStencil(model.get("entityName"), EventActionEnum.REMOVE);
    }

    //stencilName is only available for inter-service relation entities
    const stencilName = model.get("stencilName");

    if (stencilName) {
      toggleDisabledStencil(stencilName, false);
    }
  };

  useEffect(() => {
    if (!cellToEdit) {
      setDescription(mainService.description || null);

      return;
    }

    const { model } = cellToEdit;
    const serviceModel = model.get("serviceModel");
    const entityName = model.get("entityName");
    const stencilName = model.get("stencilName");
    const instanceAttributes = model.get("instanceAttributes");

    if (serviceModel) {
      setDescription(serviceModel.description);
      setModel(serviceModel);
    }

    if (instanceAttributes) {
      setAttributes(instanceAttributes);
    }

    setIsInterServiceRelation(!!stencilName);

    setIsRemovable(() => {
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
        lowerLimit && entityState.currentAmount <= lowerLimit;

      return !isCellCore && canBeRemoved && !isLowerLimitReached;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellToEdit]);

  return (
    <Wrapper
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsSm" }}
      flexWrap={{ default: "nowrap" }}
    >
      <FlexItem alignSelf={{ default: "alignSelfCenter" }}>
        <Title headingLevel="h1">{words("details")}</Title>
      </FlexItem>
      {description && (
        <Content aria-label="service-description">{description}</Content>
      )}
      {!!cellToEdit && !!model ? (
        <EntityForm
          serviceModel={model}
          isEdited={cellToEdit.model.get("isInEditMode")}
          initialState={attributes}
          onSave={onSave}
          isDisabled={!editable || isInterServiceRelation}
          isRemovable={isRemovable}
          onRemove={onRemove}
          showButtons={editable}
        />
      ) : (
        <Flex
          flex={{ default: "flex_1" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <EmptyState
            headingLevel="h4"
            variant={EmptyStateVariant.sm}
            icon={CubesIcon}
            titleText={words(
              "instanceComposer.formModal.noElementSelected.title",
            )}
          >
            <EmptyStateBody>
              {words("instanceComposer.formModal.noElementSelected")}
            </EmptyStateBody>
          </EmptyState>
        </Flex>
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  height: 100%;
  width: 300px;
  position: absolute;
  z-index: 1px;
  top: 1px;
  right: 1px;
  background: var(--pf-t--global--background--color--primary--default);
  padding: 16px;
  filter: drop-shadow(
    -0.1rem 0.1rem 0.15rem var(--pf-t--global--box-shadow--color--100)
  );
  overflow: auto;
`;
