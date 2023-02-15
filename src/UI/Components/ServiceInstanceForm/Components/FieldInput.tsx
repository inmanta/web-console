import React, { useCallback, useState } from "react";
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
} from "@/Core";
import { toOptionalBoolean } from "@/Data";
import { createFormState } from "@/UI/Components/ServiceInstanceForm/Helpers";
import { words } from "@/UI/words";
import { BooleanFormInput } from "./BooleanFormInput";
import { BooleanToggleInput } from "./BooleanToggleInput";
import { RelatedServiceProvider } from "./RelatedServiceProvider";
import { SelectFormInput } from "./SelectFormInput";
import { TextFormInput } from "./TextFormInput";

interface Props {
  field: Field;
  formState: InstanceAttributeModel;
  getUpdate: GetUpdate;
  path: string | null;
}

type GetUpdate = (path: string, value: unknown, multi?: boolean) => void;

const makePath = (path: string | null, next: string): string =>
  path === null ? next : `${path}.${next}`;

export const FieldInput: React.FC<Props> = ({
  field,
  formState,
  getUpdate,
  path,
}) => {
  //callback was used to avoid re-render in useEffect used in SelectFormInput
  const getEnumUpdate = useCallback(
    (value) => {
      getUpdate(makePath(path, field.name), value);
    },
    [getUpdate, path, field.name]
  );
  switch (field.kind) {
    case "Boolean":
      return field.isOptional ? (
        <BooleanFormInput
          aria-label={`BooleanFieldInput-${field.name}`}
          attributeName={field.name}
          isOptional={field.isOptional}
          isChecked={get(formState, makePath(path, field.name)) as boolean}
          handleInputChange={(value) =>
            getUpdate(makePath(path, field.name), toOptionalBoolean(value))
          }
          description={field.description}
          key={field.name}
        />
      ) : (
        <BooleanToggleInput
          aria-label={`BooleanToggleInput-${field.name}`}
          attributeName={field.name}
          isChecked={get(formState, makePath(path, field.name)) as boolean}
          handleInputChange={(value) =>
            getUpdate(makePath(path, field.name), toOptionalBoolean(value))
          }
          description={field.description}
          key={field.name}
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
          type={field.inputType}
          handleInputChange={(value) =>
            getUpdate(makePath(path, field.name), value)
          }
          placeholder={getPlaceholderForType(field.type)}
          typeHint={getTypeHintForType(field.type)}
          key={field.name}
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
        />
      );
    case "Nested":
      return (
        <NestedFieldInput
          field={field}
          formState={formState}
          getUpdate={getUpdate}
          path={path}
        />
      );
    case "DictList":
      return (
        <DictListFieldInput
          field={field}
          formState={formState}
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
          description={field.description}
          attributeValue={
            get(formState, makePath(path, field.name), []) as string[]
          }
          isOptional={field.isOptional}
          handleInputChange={(value) =>
            getUpdate(makePath(path, field.name), value, true)
          }
          multi={true}
        />
      );
  }
};

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

const getTypeHintForType = (typeName: string): string | undefined => {
  if (typeName.endsWith("[]")) {
    return words("inventory.form.typeHint.list")(
      typeName.substring(0, typeName.indexOf("["))
    );
  } else if (typeName.includes("dict")) {
    return words("inventory.form.typeHint.dict");
  }
  return undefined;
};

interface NestedProps {
  field: NestedField;
  formState: InstanceAttributeModel;
  getUpdate: GetUpdate;
  path: string | null;
}

const NestedFieldInput: React.FC<NestedProps> = ({
  field,
  formState,
  getUpdate,
  path,
}) => {
  const [showList, setShowList] = useState(
    !field.isOptional || formState[field.name] !== null
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
                  isDisabled={showList}
                >
                  {words("catalog.callbacks.add")}
                </Button>
                <Button
                  variant="link"
                  onClick={getOnDelete()}
                  isDisabled={!showList}
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
  getUpdate: GetUpdate;
  path: string | null;
}

const DictListFieldInput: React.FC<DictListProps> = ({
  field,
  formState,
  getUpdate,
  path,
}) => {
  const list = get(formState, makePath(path, field.name)) as Array<unknown>;

  const onAdd = () => {
    if (field.max && list.length >= field.max) {
      return;
    }

    getUpdate(makePath(path, field.name), [
      ...list,
      createFormState(field.fields),
    ]);
  };

  const getOnDelete = (index: number) => () =>
    getUpdate(makePath(path, field.name), [
      ...list.slice(0, index),
      ...list.slice(index + 1, list.length),
    ]);

  return (
    <StyledFormFieldGroupExpandable
      aria-label={`DictListFieldInput-${makePath(path, field.name)}`}
      header={
        <FormFieldGroupHeader
          titleText={{
            text: field.name,
            id: `DictListFieldInput-${makePath(path, field.name)}`,
          }}
          titleDescription={`${field.description} (${words(
            "inventory.createInstance.items"
          )(list.length)})`}
          actions={
            <Button
              variant="link"
              icon={<PlusIcon />}
              onClick={onAdd}
              isDisabled={!!field.max && list.length >= field.max}
            >
              Add
            </Button>
          }
        />
      }
    >
      {list.map((item, index) => (
        <StyledFormFieldGroupExpandable
          aria-label={`DictListFieldInputItem-${makePath(
            path,
            `${field.name}.${index + 1}`
          )}`}
          key={makePath(path, `${field.name}.${index}`)}
          header={
            <FormFieldGroupHeader
              titleText={{
                text: index + 1,
                id: `DictListFieldInputItem-${makePath(
                  path,
                  `${field.name}.${index + 1}`
                )}`,
              }}
              actions={
                <Button
                  variant="link"
                  onClick={getOnDelete(index)}
                  isDisabled={field.min > index}
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
              getUpdate={getUpdate}
              path={makePath(path, `${field.name}.${index}`)}
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
