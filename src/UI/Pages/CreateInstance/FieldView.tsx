import React from "react";
import {
  Button,
  Form,
  FormFieldGroupExpandable,
  FormFieldGroupHeader,
  FormGroup,
  TextInput,
} from "@patternfly/react-core";
import { Field } from "../../Components/ServiceInstanceForm/Field";

interface Props {
  fields: Field[];
}

export const SingleFieldView: React.FC<{ field: Field }> = ({ field }) => {
  switch (field.kind) {
    case "Flat":
      return (
        <FormGroup
          label={field.name}
          isRequired={!field.isOptional}
          fieldId="level0"
          helperText={field.description}
        >
          <TextInput isRequired={!field.isOptional} id="level0" value="" />
        </FormGroup>
      );
    case "Nested":
      return (
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
            <SingleFieldView field={field} key={field.name} />
          ))}
        </FormFieldGroupExpandable>
      );

    case "DictList":
      return (
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
            <SingleFieldView field={field} key={field.name} />
          ))}
        </FormFieldGroupExpandable>
      );
  }
};

export const FieldView: React.FC<Props> = ({ fields }) => (
  <Form>
    {fields.map((field) => (
      <SingleFieldView field={field} key={field.name} />
    ))}
  </Form>
);
