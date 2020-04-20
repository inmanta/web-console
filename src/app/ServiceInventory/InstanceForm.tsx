import { Form, ActionGroup, Button, Alert } from "@patternfly/react-core"
import React, { useState } from "react"
import { IAttributeModel, IInstanceAttributeModel } from "@app/Models/LsmModels";
import { IRequestParams, fetchInmantaApi } from "@app/utils/fetchInmantaApi";
import { InstanceFormInput } from "./InstanceFormInput";
import _ from "lodash";

const InstanceForm: React.FunctionComponent<{ attributeModels: IAttributeModel[], requestParams: IRequestParams, closeModal?: () => void, originalAttributes?: IInstanceAttributeModel, update?: boolean }> = props => {
  const initialAttributes = extractInitialAttributes(props.attributeModels, props.originalAttributes);
  const [attributes, setAttributes] = useState(initialAttributes);
  const handleInputChange = (value, event) => {
    const changedAttributeName = event.target.id;
    const changedAttribute = {};
    const attribute = props.attributeModels.find((attributeModel) => attributeModel.name === changedAttributeName);
    if (attribute && ["double", "float", "int", "integer", "number"].includes(attribute.type)) {
      changedAttribute[changedAttributeName] = Number(value);
    } else {
      changedAttribute[changedAttributeName] = value;
    }
    const updatedValue = { ...attributes, ...changedAttribute };
    setAttributes(updatedValue);
  };
  const submitForm = async () => {
    const requestParams: IRequestParams = props.requestParams;
    if (props.update) {
      await submitUpdate(requestParams, attributes, props.attributeModels, props.originalAttributes);
    } else {
      await submitCreate(requestParams, attributes, props.attributeModels);
    }
    closeContainer(props.closeModal);
  }

  return <Form>
    {Object.keys(attributes).map(
      (attributeName) => {
        return <InstanceFormInput key={attributeName} attributeModels={props.attributeModels} attributes={attributes} attributeName={attributeName} handleInputChange={handleInputChange} />;
      })}
    {!Object.keys(attributes).length && <Alert variant="info" isInline={true} title="No editable attributes found" />}
    <ActionGroup key="actions">
      {!!Object.keys(attributes).length && <Button id="submit-button" variant="primary" onClick={submitForm}>Confirm</Button>}
      <Button variant="secondary" id="cancel-button" onClick={() => closeContainer(props.closeModal)}>Cancel</Button>
    </ActionGroup>

  </Form>;
}

function extractInitialAttributes(attributeModels: IAttributeModel[], originalAttributes?: IInstanceAttributeModel): IInstanceAttributeModel {
  return attributeModels.reduce((attributes, attribute) => {
    if (originalAttributes && originalAttributes[attribute.name]) {
      attributes[attribute.name] = originalAttributes[attribute.name];
    } else if (attribute.default_value) {
      attributes[attribute.name] = attribute.default_value;
    } else {
      attributes[attribute.name] = '';
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

function ensureAttributeType(attributeModels: IAttributeModel[], attributeName: string, value: any) {
  const attribute = attributeModels.find((attributeModel) => attributeModel.name === attributeName);
  let parsedValue = value;
  try {
    if (attribute && ["double", "float", "int", "integer", "number"].includes(attribute.type)) {
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

function parseAttributes(attributes: IInstanceAttributeModel, attributeModels: IAttributeModel[]) {
  const parsedAttributes = Object.assign(
    {}, ...Object.keys(attributes)
      .map((attributeName) => ({ [attributeName]: ensureAttributeType(attributeModels, attributeName, attributes[attributeName]) })
      )
  );
  return parsedAttributes;
}

async function submitUpdate(requestParams: IRequestParams, attributeValue: IInstanceAttributeModel, attributeModels: IAttributeModel[], originalAttributes?: IInstanceAttributeModel) {
  requestParams.method = "PATCH";
  const parsedAttributes = parseAttributes(attributeValue, attributeModels);
  const updatedAttributes = getChangedAttributesOnly(parsedAttributes, originalAttributes);
  // const parsedAttributes = parseAttributes(updatedAttributes, attributeModels);
  requestParams.data = { attributes: updatedAttributes };
  await fetchInmantaApi(requestParams);
}

async function submitCreate(requestParams: IRequestParams, attributes: IInstanceAttributeModel, attributeModels: IAttributeModel[]) {
  requestParams.method = "POST";
  const parsedAttributes = parseAttributes(attributes, attributeModels)
  requestParams.data = { attributes: parsedAttributes };
  await fetchInmantaApi(requestParams);
}

function getChangedAttributesOnly(attributesAfterChanges: IInstanceAttributeModel, originalAttributes?: IInstanceAttributeModel) {
  if (!originalAttributes) {
    return attributesAfterChanges;
  };
  const changedAttributeNames = Object.keys(attributesAfterChanges).filter((attributeName) =>
    !_.isEqual(attributesAfterChanges[attributeName], originalAttributes[attributeName])
  );
  const updatedAttributes = {};
  for (const attribute of changedAttributeNames) {
    updatedAttributes[attribute] = attributesAfterChanges[attribute];
  }
  return updatedAttributes;
}


export { InstanceForm, extractInitialAttributes, ensureAttributeType, getChangedAttributesOnly };