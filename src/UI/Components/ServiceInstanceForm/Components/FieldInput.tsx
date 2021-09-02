import React from "react";
import { get } from "lodash";
import {
  Button,
  FormFieldGroupExpandable,
  FormFieldGroupHeader,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { toOptionalBoolean } from "@/Data";
import { BooleanFormInput } from "./BooleanFormInput";
import { TextFormInput } from "./TextFormInput";
import {
  InstanceAttributeModel,
  DictListField,
  Field,
  FlatField,
  NestedField,
} from "@/Core";
import { createFormState } from "@/UI/Components/ServiceInstanceForm/Helpers";

interface Props {
  field: Field;
  formState: InstanceAttributeModel;
  getUpdate: GetUpdate;
  path: string | null;
}

type Update = (value: unknown) => void;
type GetUpdate = (path: string) => Update;

const makePath = (path: string | null, next: string): string =>
  path === null ? next : `${path}.${next}`;

export const FieldInput: React.FC<Props> = ({
  field,
  formState,
  getUpdate,
  path,
}) => {
  switch (field.kind) {
    case "Flat":
      return (
        <FlatFieldInput
          field={field}
          value={get(formState, makePath(path, field.name))}
          update={getUpdate(makePath(path, field.name))}
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

interface FlatProps {
  field: FlatField;
  value: unknown;
  update: Update;
}

const FlatFieldInput: React.FC<FlatProps> = ({ field, value, update }) => {
  const changeHandler = (_, event) => {
    const target = event.target;
    let val;
    if (target.type === "radio") {
      val = toOptionalBoolean(event.target.value);
    } else {
      val = event.target.value;
    }

    update(val);
  };

  return field.inputType === "bool" ? (
    <BooleanFormInput
      aria-label={`FlatFieldInput-${field.name}`}
      attributeName={field.name}
      isOptional={field.isOptional}
      isChecked={value as boolean}
      handleInputChange={changeHandler}
      description={field.description}
      key={field.name}
    />
  ) : (
    <TextFormInput
      aria-label={`FlatFieldInput-${field.name}`}
      attributeName={field.name}
      attributeValue={value as string}
      description={field.description}
      isOptional={field.isOptional}
      type={field.inputType}
      handleInputChange={changeHandler}
      placeholder={getPlaceholderForType(field.type)}
      typeHint={getTypeHintForType(field.type)}
      key={field.name}
    />
  );
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
}) => (
  <FormFieldGroupExpandable
    aria-label={`NestedFieldInput-${makePath(path, field.name)}`}
    header={
      <FormFieldGroupHeader
        titleText={{
          text: field.name,
          id: `NestedFieldInput-${makePath(path, field.name)}`,
        }}
        titleDescription={field.description}
      />
    }
  >
    {field.fields.map((childField) => (
      <FieldInput
        field={childField}
        key={makePath(path, `${field.name}.${childField.name}`)}
        formState={formState}
        getUpdate={getUpdate}
        path={makePath(path, field.name)}
      />
    ))}
  </FormFieldGroupExpandable>
);

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
    if (list.length >= field.max) return;
    getUpdate(makePath(path, field.name))([
      ...list,
      createFormState(field.fields),
    ]);
  };

  const getOnDelete = (index: number) => () =>
    getUpdate(makePath(path, field.name))([
      ...list.slice(0, index),
      ...list.slice(index + 1, list.length),
    ]);

  return (
    <FormFieldGroupExpandable
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
              isDisabled={list.length >= field.max}
            >
              Add
            </Button>
          }
        />
      }
    >
      {list.map((item, index) => (
        <FormFieldGroupExpandable
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
        </FormFieldGroupExpandable>
      ))}
    </FormFieldGroupExpandable>
  );
};
