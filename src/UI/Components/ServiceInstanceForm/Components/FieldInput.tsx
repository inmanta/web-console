import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Button,
  FormFieldGroupExpandable,
  FormFieldGroupHeader,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { get } from "lodash-es";
import styled from "styled-components";
import {
  InstanceAttributeModel,
  DictListField,
  Field,
  NestedField,
  FormSuggestion,
} from "@/Core";
import { toOptionalBoolean } from "@/Data";
import { useSuggestedValues } from "@/Data/Managers/V2/FormSuggestions";
import { createFormState } from "@/UI/Components/ServiceInstanceForm/Helpers";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { BooleanFormInput } from "./BooleanFormInput";
import { BooleanToggleInput } from "./BooleanToggleInput";
import { RelatedServiceProvider } from "./RelatedServiceProvider";
import { SelectFormInput } from "./SelectFormInput";
import { TextFormInput } from "./TextFormInput";
import { TextListFormInput } from "./TextListFormInput";

interface Props {
  field: Field;
  formState: InstanceAttributeModel;
  originalState: InstanceAttributeModel;
  getUpdate: GetUpdate;
  path: string | null;
  isNew?: boolean;
  suggestions?: FormSuggestion | null;
}

/**
 * Type representing a function to update the state within the form.
 *
 * @param {string} path - The path within the form state to update.
 * @param {unknown} value - The new value to set at the specified path.
 * @param {boolean} [multi] - Optional flag indicating if the update is for multiple values. Default is false.
 * @returns {void}
 */
type GetUpdate = (path: string, value: unknown, multi?: boolean) => void;

/**
 * Combines the current path with the next path segment to create a new path.
 *
 * @param {string | null} path - The current path (can be null).
 * @param {string} next - The next path segment to append.
 * @returns {string} The new combined path.
 */
const makePath = (path: string | null, next: string): string =>
  path === null ? next : `${path}.${next}`;

/**
 * FieldInput component for managing form input related to a specific field.
 *
 * @param {Props} props - Props for the FieldInput component.
 *   @prop {Field} field - The field associated with the input.
 *   @prop {FormState} formState - The current form state.
 *   @prop {OriginalState} originalState - The original state of the field.
 *   @prop {Function} getUpdate - Function to get updates for the field.
 *   @prop {string} path - The path of the field within the form.
 *   @prop {boolean} isNew - Flag indicating whether the field is newly added. Default is false.
 *   @prop {FormSuggestion | null} suggestions - The suggestions for the field. Default is null.
 */
export const FieldInput: React.FC<Props> = ({
  field,
  formState,
  originalState,
  getUpdate,
  path,
  isNew = false,
  suggestions,
}) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();
  const { data, isLoading, error } = useSuggestedValues(
    suggestions,
    environment,
  ).useOneTime();
  const [suggestionsList, setSuggestionsList] = useState<string[] | null>(null);

  //callback was used to avoid re-render in useEffect used in SelectFormInput
  const getEnumUpdate = useCallback(
    (value) => {
      getUpdate(makePath(path, field.name), value);
    },
    [getUpdate, path, field.name],
  );

  useEffect(() => {
    if (!isLoading && !error) {
      // if the data is of type array, we can use it directly
      if (Array.isArray(data)) {
        setSuggestionsList(data);
      } else if (
        data &&
        data.metadata &&
        data.metadata.values &&
        Array.isArray(data.metadata.values) &&
        // TODO: remove this when the API returns a fixed format.
        data.metadata.values.every((value) => typeof value === "string")
      ) {
        setSuggestionsList(data.metadata.values);
      }
    } else {
      setSuggestionsList(null);
    }
  }, [suggestions, data, isLoading, error]);

  switch (field.kind) {
    case "Boolean":
      return field.isOptional ? (
        <BooleanFormInput
          aria-label={`BooleanFieldInput-${field.name}`}
          attributeName={field.name}
          isOptional={field.isOptional}
          isChecked={get(formState, makePath(path, field.name)) as boolean}
          handleInputChange={(value, _event) =>
            getUpdate(makePath(path, field.name), toOptionalBoolean(value))
          }
          description={field.description}
          key={field.name}
          shouldBeDisabled={
            field.isDisabled &&
            get(originalState, makePath(path, field.name)) !== undefined &&
            !isNew
          }
        />
      ) : (
        <BooleanToggleInput
          aria-label={`BooleanToggleInput-${field.name}`}
          attributeName={field.name}
          isChecked={get(formState, makePath(path, field.name)) as boolean}
          handleInputChange={(value, _event) =>
            getUpdate(makePath(path, field.name), toOptionalBoolean(value))
          }
          description={field.description}
          key={field.name}
          shouldBeDisabled={
            field.isDisabled &&
            get(originalState, makePath(path, field.name)) !== undefined &&
            !isNew
          }
        />
      );
    case "TextList":
      return (
        <TextListFormInput
          aria-label={`TextFieldInput-${field.name}`}
          attributeName={field.name}
          attributeValue={
            get(formState, makePath(path, field.name).split(".")) as string[]
          }
          description={field.description}
          isOptional={field.isOptional}
          shouldBeDisabled={
            field.isDisabled &&
            get(originalState, makePath(path, field.name).split(".")) !==
              undefined &&
            !isNew
          }
          type={field.inputType}
          handleInputChange={(value, _event) =>
            getUpdate(makePath(path, field.name), value)
          }
          placeholder={getPlaceholderForType(field.type)}
          typeHint={getTypeHintForType(field.type)}
          key={field.name}
          suggestions={suggestionsList}
        />
      );
    case "Textarea":
      return (
        <TextFormInput
          aria-label={`TextFieldInput-${field.name}`}
          attributeName={field.name}
          attributeValue={get(formState, makePath(path, field.name)) as string}
          description={field.description}
          isOptional={field.isOptional}
          shouldBeDisabled={
            field.isDisabled &&
            get(originalState, makePath(path, field.name)) !== undefined &&
            !isNew
          }
          type={field.inputType}
          handleInputChange={(value, _event) => {
            getUpdate(makePath(path, field.name), value);
          }}
          placeholder={getPlaceholderForType(field.type)}
          typeHint={getTypeHintForType(field.type)}
          key={field.name}
          isTextarea
        />
      );
    case "Text":
      return (
        <TextFormInput
          aria-label={`TextFieldInput-${field.name}`}
          attributeName={field.name}
          attributeValue={get(formState, makePath(path, field.name)) as string}
          description={field.description}
          isOptional={field.isOptional}
          shouldBeDisabled={
            field.isDisabled &&
            get(originalState, makePath(path, field.name)) !== undefined &&
            !isNew
          }
          type={field.inputType}
          handleInputChange={(value, _event) =>
            getUpdate(makePath(path, field.name), value)
          }
          placeholder={getPlaceholderForType(field.type)}
          typeHint={getTypeHintForType(field.type)}
          key={field.name}
          suggestions={suggestionsList}
        />
      );
    case "InterServiceRelation":
      return (
        <RelatedServiceProvider
          alreadySelected={
            get(formState, makePath(path, field.name), []) as string[]
          }
          key={makePath(path, field.name)}
          serviceName={field.serviceEntity}
          attributeName={field.name}
          description={field.description}
          attributeValue={
            get(formState, makePath(path, field.name) as string) as string
          }
          isOptional={field.isOptional}
          handleInputChange={(value) =>
            getUpdate(makePath(path, field.name) as string, value)
          }
        />
      );
    case "Enum":
      return (
        <SelectFormInput
          aria-label={`EnumFieldInput-${field.name}`}
          options={field.options}
          attributeName={field.name}
          attributeValue={get(formState, makePath(path, field.name)) as string}
          description={field.description}
          isOptional={field.isOptional}
          handleInputChange={getEnumUpdate}
          key={field.name}
          shouldBeDisabled={
            field.isDisabled &&
            get(originalState, makePath(path, field.name)) !== undefined &&
            !isNew
          }
        />
      );
    case "Nested":
      return (
        <NestedFieldInput
          field={field}
          formState={formState}
          originalState={originalState}
          getUpdate={getUpdate}
          path={path}
        />
      );
    case "DictList":
      return (
        <DictListFieldInput
          field={field}
          formState={formState}
          originalState={originalState}
          getUpdate={getUpdate}
          path={path}
        />
      );
    case "RelationList":
      return (
        <RelatedServiceProvider
          alreadySelected={
            get(formState, makePath(path, field.name), []) as string[]
          }
          key={makePath(path, field.name)}
          serviceName={field.serviceEntity}
          attributeName={field.name}
          description={field.description !== null ? field.description : ""}
          attributeValue={
            get(formState, makePath(path, field.name), []) as string[]
          }
          isOptional={field.isOptional}
          handleInputChange={(value) => {
            getUpdate(makePath(path, field.name), value, true);
          }}
          multi={true}
        />
      );
  }
};

/**
 * Get a placeholder for the given data type.
 *
 * @param {string} typeName - The data type name.
 * @returns {string | undefined} The placeholder string for the given data type, or undefined if not found.
 */
const getPlaceholderForType = (typeName: string): string | undefined => {
  if (typeName === "int[]") {
    return words("inventory.form.placeholder.intList");
  } else if (typeName === "float[]") {
    return words("inventory.form.placeholder.floatList");
  } else if (typeName.endsWith("[]")) {
    return words("inventory.form.placeholder.stringList");
  } else if (typeName.includes("dict")) {
    return words("inventory.form.placeholder.dict");
  }

  return undefined;
};

/**
 * Get a type hint for the given data type.
 *
 * @param {string} typeName - The data type name.
 * @returns {string | undefined} The type hint string for the given data type, or undefined if not found.
 */
const getTypeHintForType = (typeName: string): string | undefined => {
  if (typeName.endsWith("[]")) {
    return words("inventory.form.typeHint.list")(
      typeName.substring(0, typeName.indexOf("[")),
    );
  } else if (typeName.includes("dict")) {
    return words("inventory.form.typeHint.dict");
  }
  return undefined;
};

interface NestedProps {
  field: NestedField;
  formState: InstanceAttributeModel;
  originalState: InstanceAttributeModel;
  getUpdate: GetUpdate;
  path: string | null;
}

/**
 * NestedFieldInput component with inner state for managing nested field input.
 *
 * @param {NestedProps} props - Props for the NestedFieldInput component.
 *   @prop {Field} field - The nested field.
 *   @prop {FormState} formState - The form state.
 *   @prop {OriginalState} originalState - The original state of the nested field.
 *   @prop {Function} getUpdate - Function to update and get updates for the nested field.
 *   @prop {string} path - The path of the nested field.
 * @returns {JSX.Element} The rendered NestedFieldInput component.
 */
const NestedFieldInput: React.FC<NestedProps> = ({
  field,
  formState,
  originalState,
  getUpdate,
  path,
}) => {
  const [showList, setShowList] = useState(
    !field.isOptional || formState[field.name] !== null,
  );
  const onAdd = () => {
    setShowList(true);
    if (formState !== null) {
      getUpdate(makePath(path, field.name), createFormState(field.fields));
    }
  };
  const getOnDelete = () => () => {
    setShowList(false);
    return getUpdate(makePath(path, field.name), null);
  };

  return (
    <StyledFormFieldGroupExpandable
      aria-label={`NestedFieldInput-${makePath(path, field.name)}`}
      header={
        <FormFieldGroupHeader
          titleText={{
            text: field.name,
            id: `NestedFieldInput-${makePath(path, field.name)}`,
          }}
          titleDescription={field.description}
          actions={
            field.isOptional && (
              <>
                <Button
                  variant="link"
                  icon={<PlusIcon />}
                  onClick={onAdd}
                  isDisabled={
                    (field.isDisabled &&
                      get(originalState, makePath(path, field.name)) !==
                        undefined) ||
                    showList
                  }
                >
                  {words("catalog.callbacks.add")}
                </Button>
                <Button
                  variant="link"
                  onClick={getOnDelete()}
                  isDisabled={field.isDisabled || !showList}
                >
                  {words("delete")}
                </Button>
              </>
            )
          }
        />
      }
    >
      {showList &&
        field.fields.map((childField) => (
          <FieldInput
            field={childField}
            key={makePath(path, `${field.name}.${childField.name}`)}
            formState={formState}
            originalState={originalState}
            getUpdate={getUpdate}
            path={makePath(path, field.name)}
          />
        ))}
    </StyledFormFieldGroupExpandable>
  );
};

interface DictListProps {
  field: DictListField;
  formState: InstanceAttributeModel;
  originalState: InstanceAttributeModel;
  getUpdate: GetUpdate;
  path: string | null;
}

/**
 * DictListFieldInput component with inner state to manage dictionary list field input.
 *
 * @param {DictListProps} props - Props for the DictListFieldInput component.
 *   @prop {Field} field - The dictionary list field.
 *   @prop {FormState} formState - The form state.
 *   @prop {OriginalState} originalState - The original state of the dictionary list field.
 *   @prop {Function} getUpdate - Function to update and get updates for the dictionary list field.
 *   @prop {string} path - The path of the dictionary list field.
 * @returns {JSX.Element} The rendered DictListFieldInput component.
 */
const DictListFieldInput: React.FC<DictListProps> = ({
  field,
  formState,
  originalState,
  getUpdate,
  path,
}) => {
  const list = get(formState, makePath(path, field.name)) as Array<unknown>;
  const [addedItemsPaths, setAddedItemPaths] = useState<string[]>([]);

  /**
   * Add a new formField group of the same type to the list.
   * Stores the paths of the newly added elements.
   *
   * @returns void
   */
  const onAdd = () => {
    if (field.max && list.length >= field.max) {
      return;
    }

    get(originalState, makePath(path, field.name));
    setAddedItemPaths([
      ...addedItemsPaths,
      `${makePath(path, field.name)}.${list.length}`,
    ]);

    getUpdate(makePath(path, field.name), [
      ...list,
      createFormState(field.fields),
    ]);
  };

  /**
   * Delete method that also handles the update of the stored paths
   *
   * @param {index} number
   * @returns void
   */
  const getOnDelete = (index: number) => () => {
    const newPaths: string[] = [];

    /**
     * We need to update the stored paths after the deleted item,
     * because paths are dynamically defined and not fixed.
     * If the user deletes an item preceding the new items,
     * we want to make sure the path refers to the same entity.
     */
    addedItemsPaths.forEach((addedPath, indexPath) => {
      const lastDigit: number = Number(addedPath.slice(-1));

      if (indexPath < index) {
        newPaths.push(addedPath); // add addedPath to newPath
      } else if (lastDigit > index) {
        const truncatedPath = addedPath.slice(0, -1); // truncate the last digit
        const modifiedPath = `${truncatedPath}${lastDigit - 1}`; // deduce 1 from the index
        newPaths.push(modifiedPath);
      }
    });

    setAddedItemPaths([...newPaths]);

    getUpdate(makePath(path, field.name), [
      ...list.slice(0, index),
      ...list.slice(index + 1, list.length),
    ]);
  };

  return (
    <StyledFormFieldGroupExpandable
      aria-label={`DictListFieldInput-${makePath(path, field.name)}`}
      header={
        <FormFieldGroupHeader
          titleText={{
            text: field.name,
            id: `DictListFieldInput-${makePath(path, field.name)}`,
          }}
          titleDescription={`${
            field.description !== null ? field.description : ""
          } (${words("inventory.createInstance.items")(list.length)})`}
          actions={
            <Button
              variant="link"
              icon={<PlusIcon />}
              onClick={onAdd}
              isDisabled={
                (field.isDisabled &&
                  get(originalState, makePath(path, field.name)) !==
                    undefined) ||
                (!!field.max && list.length >= field.max)
              }
            >
              Add
            </Button>
          }
        />
      }
    >
      {list.map((_item, index) => (
        <StyledFormFieldGroupExpandable
          aria-label={`DictListFieldInputItem-${makePath(
            path,
            `${field.name}.${index}`,
          )}`}
          key={makePath(path, `${field.name}.${index}`)}
          header={
            <FormFieldGroupHeader
              titleText={{
                text: index,
                id: `DictListFieldInputItem-${makePath(
                  path,
                  `${field.name}.${index}`,
                )}`,
              }}
              actions={
                <Button
                  variant="link"
                  onClick={getOnDelete(index)}
                  isDisabled={
                    (field.isDisabled &&
                      get(originalState, makePath(path, field.name)) !==
                        undefined) ||
                    field.min > index
                  }
                >
                  Delete
                </Button>
              }
            />
          }
        >
          {field.fields.map((childField) => (
            <FieldInput
              field={childField}
              key={makePath(path, `${field.name}.${index}.${childField.name}`)}
              formState={formState}
              originalState={originalState}
              getUpdate={getUpdate}
              path={makePath(path, `${field.name}.${index}`)}
              isNew={addedItemsPaths.includes(
                `${makePath(path, field.name)}.${index}`,
              )}
            />
          ))}
        </StyledFormFieldGroupExpandable>
      ))}
    </StyledFormFieldGroupExpandable>
  );
};

const StyledFormFieldGroupExpandable = styled(FormFieldGroupExpandable)`
  min-height: 0;
`;
