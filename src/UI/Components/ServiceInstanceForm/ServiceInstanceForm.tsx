import React, { useState } from "react";
import { get, set } from "lodash";
import {
  ActionGroup,
  Button,
  Form,
  FormFieldGroupExpandable,
  FormFieldGroupHeader,
} from "@patternfly/react-core";
import { words } from "@/UI/words";
import { FormAttributeResult, InstanceAttributeModel } from "@/Core";
import { toOptionalBoolean } from "@/Data";
import { BooleanFormInput } from "./BooleanFormInput";
import { TextFormInput } from "./TextFormInput";
import {
  DictListField,
  Field,
  FlatField,
  isFlatField,
  NestedField,
} from "./Field";
import { createEmptyFromFields } from "./FieldCreator";

interface Props {
  fields: Field[];
  onSubmit(attributes: FormAttributeResult[]): void;
  onCancel(): void;
}

export const ServiceInstanceForm: React.FC<Props> = ({
  fields: allFields,
  onSubmit,
  onCancel,
}) => {
  const fields = allFields.filter(isFlatField);
  const initialState = createEmptyFromFields(fields);
  const [formState, setFormState] = useState(initialState);
  const getChangeHandler = (path: string) => (_, event) => {
    const target = event.target;
    let val;
    if (target.type === "radio") {
      val = toOptionalBoolean(event.target.value);
    } else {
      val = event.target.value;
    }

    setFormState((prev) => {
      const clone = { ...prev };
      return set(clone, path, val);
    });
  };
  const formStateToAttributeArray = (state): FormAttributeResult[] => {
    return fields.map((inputAttribute) => ({
      name: inputAttribute.name,
      type: inputAttribute.type,
      value: state[inputAttribute.name],
    }));
  };

  return (
    <>
      <Form>
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            formState={formState}
            getChangeHandler={getChangeHandler}
            path={null}
          />
        ))}

        <ActionGroup>
          <Button
            variant="primary"
            onClick={() => onSubmit(formStateToAttributeArray(formState))}
          >
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
type ChangeHandler = (_, event) => void;
type GetChangeHandler = (path: string) => ChangeHandler;

interface FieldProps {
  field: Field;
  formState: InstanceAttributeModel;
  getChangeHandler: GetChangeHandler;
  path: string | null;
}

const FieldInput: React.FC<FieldProps> = ({
  field,
  formState,
  getChangeHandler,
  path,
}) => {
  switch (field.kind) {
    case "Flat":
      return (
        <FlatFieldInput
          field={field}
          value={get(
            formState,
            path === null ? field.name : `${path}.${field.name}`
          )}
          changeHandler={getChangeHandler(
            path === null ? field.name : `${path}.${field.name}`
          )}
        />
      );
    case "Nested":
      return (
        <NestedFieldInput
          field={field}
          formState={formState}
          getChangeHandler={getChangeHandler}
          path={`${path}.${field.name}`}
        />
      );
    case "DictList":
      return (
        <DictListFieldInput
          field={field}
          formState={formState}
          getChangeHandler={getChangeHandler}
          path={`${path}.${field.name}`}
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
  changeHandler: ChangeHandler;
}

const FlatFieldInput: React.FC<FlatProps> = ({ field, changeHandler, value }) =>
  field.inputType === "bool" ? (
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

interface NestedProps {
  field: NestedField;
  formState: InstanceAttributeModel;
  getChangeHandler: GetChangeHandler;
  path: string;
}

const NestedFieldInput: React.FC<NestedProps> = ({
  field,
  formState,
  getChangeHandler,
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
    {field.fields.map((field) => (
      <FieldInput
        field={field}
        key={field.name}
        formState={formState}
        getChangeHandler={getChangeHandler}
        path={`${path}.${field.name}`}
      />
    ))}
  </FormFieldGroupExpandable>
);

interface DictListProps {
  field: DictListField;
  formState: InstanceAttributeModel;
  getChangeHandler: GetChangeHandler;
  path: string;
}

const DictListFieldInput: React.FC<DictListProps> = ({
  field,
  formState,
  getChangeHandler,
  path,
}) => (
  <FormFieldGroupExpandable
    header={
      <FormFieldGroupHeader
        titleText={{
          text: field.name,
          id: "field-group1-titleText-id",
        }}
        titleDescription={field.description}
        actions={
          <>
            <Button variant="link">Delete all</Button>
            <Button variant="secondary">Create</Button>
          </>
        }
      />
    }
  >
    {field.fields.map((field) => (
      <FieldInput
        field={field}
        key={field.name}
        formState={formState}
        getChangeHandler={getChangeHandler}
        path={`${path}.${field.name}`}
      />
    ))}
  </FormFieldGroupExpandable>
);
