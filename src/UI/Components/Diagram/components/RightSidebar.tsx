import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Flex,
  FlexItem,
  TextContent,
  Title,
} from "@patternfly/react-core";
import styled from "styled-components";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
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
 * Deleting a whole instance is not possible through composer, we can only delete parts of the instance if the service model allows it.
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

  useEffect(() => {
    if (isFormOpen) {
      setIsFormOpen(false); //as sidebar is always open, we need to close form when we click on another entity
    }

    if (!cellToEdit) {
      setDescription(mainService.description || null);

      return;
    }

    const serviceModel = cellToEdit.model.get("serviceModel");
    const entityName = cellToEdit.model.get("entityName");
    const instanceAttributes = cellToEdit.model.get("instanceAttributes");

    if (serviceModel) {
      setDescription(serviceModel.description);
      setModel(serviceModel);
    }

    if (instanceAttributes) {
      setAttributes(instanceAttributes);
    }

    setIsAllowedToRemove((_prev) => {
      const isCellCore = cellToEdit.model.get("isCore");

      //children entities are not allowed to be removed, as well as rw embedded entities in the edit form
      const canBeRemoved = !cellToEdit.model.get("cantBeRemoved");

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
            isEdited={cellToEdit?.model.get("isInEditMode")}
            initialState={attributes}
            isForDisplay={!isFormOpen}
            onSave={(fields, formState) => {
              if (cellToEdit && diagramHandlers) {
                const sanitizedAttrs = sanitizeAttributes(fields, formState);

                if (cellToEdit) {
                  //deep copy
                  const shape = diagramHandlers.editEntity(
                    cellToEdit,
                    model,
                    formState,
                  );

                  shape.set("sanitizedAttrs", sanitizedAttrs);

                  setServiceOrderItems((prev) =>
                    updateServiceOrderItems(shape, ActionEnum.UPDATE, prev),
                  );
                }
              }
              setIsFormOpen(false);
            }}
            onCancel={() => {
              setIsFormOpen(false);
            }}
          />
        )}

        {!isFormOpen && (
          <Flex justifyContent={{ default: "justifyContentCenter" }}>
            <FlexItem>
              <StyledButton
                variant="danger"
                width={200}
                onClick={() => {
                  //logic of deleting cell stayed in the halo which triggers the event
                  cellToEdit?.trigger("action:delete");

                  const isEmbedded = cellToEdit?.model.get("isEmbedded");

                  if (isEmbedded) {
                    //dispatch event instead of calling function directly from context
                    document.dispatchEvent(
                      new CustomEvent("updateStencil", {
                        detail: {
                          name: cellToEdit?.model.get("entityName"),
                          action: EmbeddedEventEnum.REMOVE,
                        },
                      }),
                    );
                  }

                  //stencilName is only available for inter-service relation entities
                  const stencilName = cellToEdit?.model.get("stencilName");

                  if (stencilName) {
                    document
                      .querySelector(`.${stencilName}_body`)
                      ?.classList.remove("stencil_accent-disabled");
                    document
                      .querySelector(`.${stencilName}_bodyTwo`)
                      ?.classList.remove("stencil_body-disabled");
                    document
                      .querySelector(`.${stencilName}_text`)
                      ?.classList.remove("stencil_text-disabled");
                  }
                }}
                isDisabled={!isAllowedToRemove || !cellToEdit}
              >
                {words("remove")}
              </StyledButton>
            </FlexItem>
            <FlexItem>
              <StyledButton
                variant="primary"
                width={200}
                onClick={() => {
                  setIsFormOpen(true);
                }}
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
