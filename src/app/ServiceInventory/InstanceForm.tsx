import { Form, ActionGroup, Button, Alert } from "@patternfly/react-core"
import React, { useState } from "react"
import { IAttributeModel, IInstanceAttributeModel } from "@app/Models/LsmModels";
import { IRequestParams, fetchInmantaApi } from "@app/utils/fetchInmantaApi";
import { InstanceFormInput } from "./InstanceFormInput";

const InstanceForm: React.FunctionComponent<{ attributeModels: IAttributeModel[], requestParams: IRequestParams, closeModal?: () => void, originalAttributes?: IInstanceAttributeModel }> = props => {
  const initialAttributes = extractInitialAttributes(props.attributeModels, props.originalAttributes);
  const [attributes, setAttributes] = useState(initialAttributes);
  const handleInputChange = (value, event) => {
    const changedAttributeName = event.target.id;
    const changedAttribute = {};
    changedAttribute[changedAttributeName] = value;
    const updatedValue = { ...attributes, ...changedAttribute };
    setAttributes(updatedValue);
  };
  const submitForm = async () => {
    const requestParams: IRequestParams = props.requestParams;
    if (props.originalAttributes) {
      await submitUpdate(requestParams, attributes, props.originalAttributes)
    } else {
      await submitCreate(requestParams, attributes);
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
    }
    else {
      attributes[attribute.name] = '';
    }
    return attributes;
  }, {});
}

function closeContainer(closingFunction?: () => void): void {
  if (closingFunction) {
    closingFunction();
  }
}

async function submitUpdate(requestParams: IRequestParams, attributeValue: IInstanceAttributeModel, originalAttributes: IInstanceAttributeModel) {
  requestParams.method = "PATCH";
  const updatedAttributes = getChangedAttributesOnly(attributeValue, originalAttributes);
  requestParams.data = { attributes: updatedAttributes };
  await fetchInmantaApi(requestParams);
}

async function submitCreate(requestParams, attributes) {
  requestParams.method = "POST";
  requestParams.data = { attributes };
  await fetchInmantaApi(requestParams);
}

function getChangedAttributesOnly(attributesAfterChanges: IInstanceAttributeModel, originalAttributes: IInstanceAttributeModel) {
  const changedAttributeNames = Object.keys(attributesAfterChanges).filter((attributeName) =>
    attributesAfterChanges[attributeName] !== originalAttributes[attributeName]
  );
  const updatedAttributes = {};
  for (const attribute of changedAttributeNames) {
    updatedAttributes[attribute] = attributesAfterChanges[attribute];
  }
  return updatedAttributes;
}


export { InstanceForm, extractInitialAttributes, getChangedAttributesOnly };