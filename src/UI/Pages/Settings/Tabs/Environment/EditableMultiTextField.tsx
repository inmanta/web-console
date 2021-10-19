import { Maybe } from "@/Core";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TextInput,
} from "@patternfly/react-core";
import React, { useState } from "react";
import styled from "styled-components";
import {
  CancelEditButton,
  EnableEditButton,
  SubmitEditButton,
} from "./InlineEditButtons";
import { InlinePlainAlert } from "./InlinePlainAlert";

interface Props {
  groupName: string;
  initialValues: Record<string, string>;
  onSubmit: (
    fieldDescriptors: Record<string, string>
  ) => Promise<Maybe.Type<string>>;
}

export const EditableMultiTextField: React.FC<Props> = ({
  groupName,
  initialValues,
  onSubmit,
}) => {
  const [editable, setEditable] = useState(false);
  const [fieldValues, setFieldValues] = useState(initialValues);
  const [submitError, setSubmitError] = useState("");
  const onSubmitRequest = async (values: Record<string, string>) => {
    setEditable(false);
    const error = await onSubmit(values);
    if (Maybe.isSome(error)) {
      setSubmitError(error.value);
    }
  };
  const onKeyDown = (event) => {
    if (event.key && event.key !== "Enter") return;
    onSubmitRequest(fieldValues);
  };
  const onEditClick = () => {
    setEditable(true);
    setSubmitError("");
  };
  const onSubmitClick = () => onSubmitRequest(fieldValues);
  const onCancelEditClick = () => {
    setEditable(false);
    setFieldValues(initialValues);
  };
  const onCloseAlert = () => setSubmitError("");
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        {groupName}
        {!editable && (
          <EnableEditButton
            onClick={onEditClick}
            aria-label={`${groupName}-toggle-edit`}
          />
        )}
        {editable && (
          <>
            <SubmitEditButton
              aria-label={`${groupName}-submit-edit`}
              onClick={onSubmitClick}
            />
            <CancelEditButton
              aria-label={`${groupName}-cancel-edit`}
              onClick={onCancelEditClick}
            />
          </>
        )}
      </DescriptionListTerm>
      {submitError && (
        <InlinePlainAlert
          aria-label={`${groupName}-error-message`}
          errorMessage={submitError}
          closeButtonAriaLabel={`${groupName}-close-error`}
          onCloseAlert={onCloseAlert}
        />
      )}
      <DescriptionListDescription>
        <DescriptionList>
          {Object.entries(fieldValues).map(([label, value]) => (
            <DescriptionListGroup key={label}>
              <DescriptionListTerm aria-label={`${label}-label`}>
                {label}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {!editable && (
                  <HeightMatched aria-label={`${label}-value`}>
                    {value}
                  </HeightMatched>
                )}
                {editable && (
                  <Flex spaceItems={{ default: "spaceItemsNone" }}>
                    <FlexItem>
                      <TextInput
                        aria-label={`${label}-input`}
                        value={value}
                        onChange={(input) => {
                          const updated = { ...fieldValues };
                          updated[label] = input;
                          setFieldValues(updated);
                        }}
                        onKeyDown={onKeyDown}
                      />
                    </FlexItem>
                  </Flex>
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

const HeightMatched = styled.div`
  height: 36px;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 9px;
`;
