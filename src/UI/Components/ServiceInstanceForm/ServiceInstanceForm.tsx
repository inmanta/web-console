import React, { useState } from "react";
import { get, set } from "lodash";
import {
  ActionGroup,
  Button,
  Form,
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
import { fieldsToFormState } from "./FieldCreator";

interface Props {
  fields: Field[];
  onSubmit(fields: Field[], formState: InstanceAttributeModel): void;
  onCancel(): void;
}

export const ServiceInstanceForm: React.FC<Props> = ({
  fields,
  onSubmit,
  onCancel,
}) => {
  const [formState, setFormState] = useState(fieldsToFormState(fields));

  const getUpdate =
    (path: string) =>
    (value: unknown): void =>
      setFormState((prev) => {
        const clone = { ...prev };
        return set(clone, path, value);
      });

  return (
    <>
      <Form>
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            formState={formState}
            getUpdate={getUpdate}
            path={null}
          />
        ))}

        <ActionGroup>
          <Button variant="primary" onClick={() => onSubmit(fields, formState)}>
            {words("confirm")}
          </Button>
          <Button variant="link" onClick={onCancel}>
            {words("cancel")}
          </Button>
        </ActionGroup>
      </Form>
    </>
  );
};

type Update = (value: unknown) => void;
type GetUpdate = (path: string) => Update;

interface FieldProps {
  field: Field;
  formState: InstanceAttributeModel;
  getUpdate: GetUpdate;
  path: string | null;
}

const makePath = (path: string | null, next: string): string =>
  path === null ? next : `${path}.${next}`;

const FieldInput: React.FC<FieldProps> = ({
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
      attributeName={field.name}
      isOptional={field.isOptional}
      isChecked={value as boolean}
      handleInputChange={changeHandler}
      description={field.description}
      key={field.name}
    />
  ) : (
    <TextFormInput
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
    header={
      <FormFieldGroupHeader
        titleText={{
          text: field.name,
          id: "nested-field-group1-titleText-id",
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
  const list = get(formState, makePath(path, field.name));

  const onAdd = () => {
    if (list.length >= field.max) return;
    getUpdate(makePath(path, field.name))([
      ...list,
      fieldsToFormState(field.fields),
    ]);
  };

  const getOnDelete = (index: number) => () =>
    getUpdate(makePath(path, field.name))([
      ...list.slice(0, index),
      ...list.slice(index + 1, list.length),
    ]);

  return (
    <FormFieldGroupExpandable
      header={
        <FormFieldGroupHeader
          titleText={{
            text: `${field.name} (${list.length})`,
            id: "field-group1-titleText-id",
          }}
          titleDescription={field.description}
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
          key={makePath(path, `${field.name}.${index}`)}
          header={
            <FormFieldGroupHeader
              titleText={{
                text: index + 1,
                id: "nested-field-group1-titleText-id",
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
