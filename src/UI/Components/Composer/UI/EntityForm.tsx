import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, FlexItem, Form } from "@patternfly/react-core";
import { set } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { Field, InstanceAttributeModel } from "@/Core";
import { sanitizeAttributes } from "@/Data";
import { CreateModifierHandler, FieldCreator } from "@/UI/Components/ServiceInstanceForm";
import { FieldInput } from "@/UI/Components/ServiceInstanceForm/Components";
import { words } from "@/UI/words";
import { ComposerContext } from "../Data/Context";
import { ServiceEntityShape } from "./JointJsShapes/ServiceEntityShape";
import { updateAllMissingConnectionsHighlights } from "./JointJsShapes/createHalo";

interface Props {
  activeCell: ServiceEntityShape;
  isDisabled: boolean;
}

/**
 * `EntityForm` is a React functional component that renders a form for a service entity.
 * The form fields are created based on the attributes of the service model.
 * Unlike the InstanceForm, this is a sub-form and doesn't have the embedded/inter-service-relation form elements
 *
 * When the form is submitted, the attributes are updated on the shape and the sanitizedAttrs are updated.
 *
 * @props {Props} props - The properties passed to the component.
 * @prop {ServiceEntityShape} activeCell - The shape being edited.
 * @prop {boolean} isDisabled - A flag that indicates whether the form is disabled.
 *
 * @returns {React.FC<Props>} The EntityForm component.
 */
export const EntityForm: React.FC<Props> = ({ activeCell, isDisabled }) => {
  const { paper, setCanvasState } = useContext(ComposerContext);
  const [formState, setFormState] = useState<InstanceAttributeModel>({});
  const [fields, setFields] = useState<Field[] | null>(null);
  const [originalState, setOriginalState] = useState<InstanceAttributeModel>({});
  const [isDirty, setIsDirty] = useState(false);
  const [currentCellId, setCurrentCellId] = useState<string | null>(null);

  /**
   * function to update the state within the form.
   *
   * @param {string} path - The path within the form state to update.
   * @param {unknown} value - The new value to set at the specified path.
   * @param {boolean} [multi] - Optional flag indicating if the update is for an array of values.
   * @returns {void}
   */
  const getUpdate = (path: string, value: unknown, multi = false): void => {
    if (!fields) {
      return;
    }

    if (!isDirty) {
      setIsDirty(true);
    }

    //if multi is true, it means the field is a multi-select field and we need to update the array of values
    let updatedValue = {};

    if (multi) {
      setFormState((prev) => {
        const clone = { ...prev };
        let selection = (clone[path] as string[]) || [];

        //if the value is already in the array, remove it, otherwise add it
        if (selection.includes(value as string)) {
          selection = selection.filter((item) => item !== (value as string));
        } else {
          selection.push(value as string);
        }

        updatedValue = set(clone, path, selection);

        return updatedValue;
      });
    } else {
      setFormState((prev) => {
        const clone = { ...prev };

        updatedValue = set(clone, path, value);

        return updatedValue;
      });
    }
  };

  /**
   * Creates fields for the entity form using the FieldCreator class and sets them in the state.
   *
   * This function is memoized using useCallback to avoid unnecessary re-renders. It creates a new FieldCreator instance with a CreateModifierHandler.
   * It then converts the service model attributes to fields and assigns a unique ID to each field before setting them in the state.
   *
   * @returns {void}
   */
  const createFieldsAndState = useCallback(() => {
    const serviceModel = activeCell.serviceModel;
    // Always get fresh data from the activeCell to ensure we have the correct attributes for this specific cell
    const instanceAttributes = activeCell.getSanitizedAttributes() || {};

    // When editing existing instances, set edit mode to true so that fields with modifier "rw"
    // become read-only (only "rw+" fields stay editable). Brand-new shapes remain editable.
    const isInEditMode = !activeCell.isNew;
    const fieldCreator = new FieldCreator(new CreateModifierHandler(), isInEditMode);
    const selectedFields = fieldCreator.attributesToFields(serviceModel.attributes || []);

    setFields(selectedFields.map((field) => ({ ...field, id: uuidv4() })));
    // Always update formState with the new cell's attributes
    setFormState(instanceAttributes);
    setOriginalState(instanceAttributes);
    setIsDirty(false);
    setCurrentCellId(activeCell.id);
  }, [activeCell]);

  /**
   * Handles the save action for the form.
   * Updates the shape's attributes and sanitizedAttrs.
   * Also triggers validation and highlight updates.
   *
   * @param {InstanceAttributeModel} updatedFormState - The updated form state to save.
   * @returns {void}
   */
  const onSave = useCallback(
    (updatedFormState: InstanceAttributeModel) => {
      if (fields) {
        const sanitizedAttrs = sanitizeAttributes(fields, updatedFormState);

        // Update the shape's attributes (this also triggers validateAttributes internally)
        activeCell.updateAttributes(updatedFormState);

        // Update sanitizedAttrs on the shape
        activeCell.sanitizedAttrs = sanitizedAttrs;

        // Force view update - JointJS might not detect items changes automatically
        if (paper) {
          const cellView = paper.findViewByModel(activeCell);
          if (cellView) {
            cellView.update();
          }
        }

        // Update canvas state to trigger validation checks in Composer.tsx
        setCanvasState((prev) => {
          const updated = new Map(prev);
          updated.set(activeCell.id, activeCell);
          return updated;
        });

        // Trigger highlight updates to reflect validation state changes
        if (paper) {
          updateAllMissingConnectionsHighlights(paper);
        }
      }
    },
    [activeCell, fields, setCanvasState, paper]
  );

  // Re-initialize when activeCell changes (detected by ID change)
  useEffect(() => {
    if (activeCell.id !== currentCellId) {
      createFieldsAndState();
    }
  }, [activeCell.id, currentCellId, createFieldsAndState]);

  // Auto-save when formState changes (similar to old implementation)
  useEffect(() => {
    if (isDirty && formState) {
      onSave(formState);
    }
  }, [formState, isDirty, onSave]);

  return (
    <>
      {fields && fields.length <= 0 && (
        <FlexItem>
          <Alert variant="info" isInline title={words("instanceComposer.formModal.noAttributes")} />
        </FlexItem>
      )}
      <FlexItem flex={{ default: "flex_1" }}>
        <Form
          data-testid="entity-form"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          {fields &&
            fields.map((field) => (
              <FieldInput
                originalState={originalState}
                key={field.name}
                field={{
                  ...field,
                  isDisabled: isDisabled || field.isDisabled,
                }}
                formState={formState}
                getUpdate={getUpdate}
                path={null}
                suggestions={field.suggestion}
              />
            ))}
        </Form>
      </FlexItem>
    </>
  );
};
