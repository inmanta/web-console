import { Form, ActionGroup, Button, Alert } from "@patternfly/react-core";
import React, { useState } from "react";
import { AttributeModel } from "@/Core";
import { IInstanceAttributeModel } from "@app/Models/LsmModels";
import { IRequestParams, fetchInmantaApi } from "@app/utils/fetchInmantaApi";
import { InstanceFormInput, isNumberType } from "./InstanceFormInput";
import _ from "lodash";

const InstanceForm: React.FunctionComponent<{
  attributeModels: AttributeModel[];
  requestParams: IRequestParams;
  closeModal?: () => void;
  originalAttributes?: IInstanceAttributeModel;
  update?: boolean;
}> = (props) => {
  const initialAttributes = extractInitialAttributes(
    props.attributeModels,
    props.originalAttributes
  );
  const [attributes, setAttributes] = useState(initialAttributes);
  const handleInputChange = (value, event) => {
    const changedAttributeName = event.target.name;
    const changedAttribute = {};
    if (event.target.type === "radio") {
      changedAttribute[changedAttributeName] = toOptionalBoolean(
        event.target.value
      );
    } else {
      changedAttribute[changedAttributeName] = event.target.value;
    }
    const updatedValue = { ...attributes, ...changedAttribute };
    setAttributes(updatedValue);
  };
  const submitForm = async () => {
    const requestParams: IRequestParams = props.requestParams;
    if (props.update) {
      await submitUpdate(
        requestParams,
        attributes,
        props.attributeModels,
        props.originalAttributes
      );
    } else {
      await submitCreate(requestParams, attributes, props.attributeModels);
    }
    closeContainer(props.closeModal);
  };

  return (
    <Form>
      {Object.keys(attributes).map((attributeName) => {
        return (
          <InstanceFormInput
            key={attributeName}
            attributeModels={props.attributeModels}
            attributes={attributes}
            attributeName={attributeName}
            handleInputChange={handleInputChange}
          />
        );
      })}
      {!Object.keys(attributes).length && (
        <Alert
          variant="info"
          isInline={true}
          title="No editable attributes found"
        />
      )}
      <ActionGroup key="actions">
        {!!Object.keys(attributes).length && (
          <Button id="submit-button" variant="primary" onClick={submitForm}>
            Confirm
          </Button>
        )}
        <Button
          variant="secondary"
          id="cancel-button"
          onClick={() => closeContainer(props.closeModal)}
        >
          Cancel
        </Button>
      </ActionGroup>
    </Form>
  );
};

function extractInitialAttributes(
  attributeModels: AttributeModel[],
  originalAttributes?: IInstanceAttributeModel
): IInstanceAttributeModel {
  return attributeModels.reduce((attributes, attribute) => {
    if (
      attribute.type.includes("bool") &&
      originalAttributes &&
      originalAttributes[attribute.name] !== undefined
    ) {
      attributes[attribute.name] = originalAttributes[attribute.name];
    } else if (originalAttributes && originalAttributes[attribute.name]) {
      attributes[attribute.name] = originalAttributes[attribute.name];
    } else if (attribute.default_value) {
      attributes[attribute.name] = attribute.default_value;
    } else {
      attributes[attribute.name] = "";
    }
    if (attribute.type.includes("dict") && attributes[attribute.name]) {
      attributes[attribute.name] = JSON.stringify(attributes[attribute.name]);
    }
    return attributes;
  }, {});
}

function closeContainer(closingFunction?: () => void): void {
  if (closingFunction) {
    closingFunction();
  }
}

function toOptionalBoolean(value?: string): boolean | null {
  if (value?.toLocaleLowerCase() === "true") {
    return true;
  } else if (value?.toLocaleLowerCase() === "false") {
    return false;
  } else {
    return null;
  }
}

function ensureAttributeType(
  attributeModels: AttributeModel[],
  attributeName: string,
  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
  value: any
): unknown {
  const attribute = attributeModels.find(
    (attributeModel) => attributeModel.name === attributeName
  );
  let parsedValue = value;
  try {
    if (attribute && attribute.type.includes("bool")) {
      parsedValue = toOptionalBoolean(value);
    } else if (attribute && attribute.type.includes("?") && value === "") {
      parsedValue = null;
    } else if (attribute && isNumberType(attribute.type)) {
      parsedValue = Number(value);
    } else if (attribute && attribute.type.includes("[]")) {
      const parts = value.split(",").map((piece) => piece.trim());
      parsedValue = parts;
    } else if (attribute && attribute.type.includes("dict")) {
      parsedValue = JSON.parse(value);
    }
  } catch (error) {
    // Let the backend validate for now
    parsedValue = value;
  }
  return parsedValue;
}

function parseAttributes(
  attributes: IInstanceAttributeModel,
  attributeModels: AttributeModel[]
) {
  const parsedAttributes = Object.assign(
    {},
    ...Object.keys(attributes).map((attributeName) => ({
      [attributeName]: ensureAttributeType(
        attributeModels,
        attributeName,
        attributes[attributeName]
      ),
    }))
  );
  return parsedAttributes;
}

async function submitUpdate(
  requestParams: IRequestParams,
  attributeValue: IInstanceAttributeModel,
  attributeModels: AttributeModel[],
  originalAttributes?: IInstanceAttributeModel
) {
  requestParams.method = "PATCH";
  const parsedAttributes = parseAttributes(attributeValue, attributeModels);
  const updatedAttributes = getChangedAttributesOnly(
    parsedAttributes,
    originalAttributes
  );
  requestParams.data = { attributes: updatedAttributes };
  await fetchInmantaApi(requestParams);
}

async function submitCreate(
  requestParams: IRequestParams,
  attributes: IInstanceAttributeModel,
  attributeModels: AttributeModel[]
) {
  requestParams.method = "POST";
  const parsedAttributes = parseAttributes(attributes, attributeModels);
  // Don't set optional attributes explicitly to null on creation
  const attributesWithoutNulls = Object.entries(parsedAttributes).reduce(
    (obj, [k, v]) => (v === null ? obj : ((obj[k] = v), obj)),
    {}
  );
  requestParams.data = { attributes: attributesWithoutNulls };
  await fetchInmantaApi(requestParams);
}

function getChangedAttributesOnly(
  attributesAfterChanges: IInstanceAttributeModel,
  originalAttributes?: IInstanceAttributeModel
): IInstanceAttributeModel {
  if (!originalAttributes) {
    return attributesAfterChanges;
  }
  // Don't include changes from undefined to null, but allow setting a value explicitly to null
  const changedAttributeNames = Object.keys(attributesAfterChanges).filter(
    (attributeName) =>
      !(
        originalAttributes[attributeName] === undefined &&
        attributesAfterChanges[attributeName] === null
      ) &&
      !_.isEqual(
        attributesAfterChanges[attributeName],
        originalAttributes[attributeName]
      )
  );
  const updatedAttributes = {};
  for (const attribute of changedAttributeNames) {
    updatedAttributes[attribute] = attributesAfterChanges[attribute];
  }
  return updatedAttributes;
}

export {
  InstanceForm,
  extractInitialAttributes,
  ensureAttributeType,
  getChangedAttributesOnly,
};
