import React, { useEffect, useState } from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TextInput,
} from "@patternfly/react-core";
import { convertToTitleCase } from "@/UI/Utils";
import { CancelEditButton, EnableEditButton, SubmitEditButton } from "./InlineEditButtons";
import { InlineValue } from "./InlineFillers";
import { InlinePlainAlert } from "./InlinePlainAlert";

interface Props {
  groupName: string;
  initialValues: Record<string, string>;
  initiallyEditable?: boolean;
  onSubmit: (fieldDescriptors: Record<string, string>) => void;
  error?: string | null;
  setError: (error: string | null) => void;
}

/**
 * EditableMultiTextField component
 *
 * @props {Props} props - The component props
 * @prop {string} groupName - The name of the group
 * @prop {Record<string, string>} initialValues - The initial values of the fields
 * @prop {boolean} initiallyEditable - Whether the fields are initially editable
 * @prop {Function} onSubmit - The function to call when the form is submitted
 * @prop {string | null} [error] - The error message of the field
 * @prop {Function} setError - The function to call to set/clear the error message
 *
 * @returns {React.FC<Props>} - The EditableMultiTextField component
 */
export const EditableMultiTextField: React.FC<Props> = ({
  groupName,
  initialValues,
  initiallyEditable,
  onSubmit,
  error,
  setError,
}) => {
  const [editable, setEditable] = useState(initiallyEditable);
  const [fieldValues, setFieldValues] = useState(initialValues);
  const onSubmitRequest = async (values: Record<string, string>) => {
    setEditable(false);
    onSubmit(values);
  };

  const onKeyDown = (event) => {
    if (event.key && event.key !== "Enter") return;

    onSubmitRequest(fieldValues);
  };

  const onEditClick = () => {
    setEditable(true);
    setError(null);
  };

  const onSubmitClick = () => onSubmitRequest(fieldValues);

  const onCancelEditClick = () => {
    setEditable(false);
    setFieldValues(initialValues);
  };

  const onCloseAlert = () => setError(null);

  const onChange = (label: string) => (input: string) => {
    const updated = { ...fieldValues };

    updated[label] = input;
    setFieldValues(updated);
  };

  useEffect(() => {
    setFieldValues(initialValues);
  }, [initialValues]);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        {groupName}
        {!editable && (
          <EnableEditButton onClick={onEditClick} aria-label={`${groupName}-toggle-edit`} />
        )}
        {editable && (
          <>
            <SubmitEditButton aria-label={`${groupName}-submit-edit`} onClick={onSubmitClick} />
            <CancelEditButton aria-label={`${groupName}-cancel-edit`} onClick={onCancelEditClick} />
          </>
        )}
      </DescriptionListTerm>
      {error && (
        <InlinePlainAlert
          aria-label={`${groupName}-error-message`}
          errorMessage={error}
          closeButtonAriaLabel={`${groupName}-close-error`}
          onCloseAlert={onCloseAlert}
        />
      )}
      <DescriptionListDescription>
        <DescriptionList>
          {Object.entries(fieldValues).map(([label, value]) => (
            <DescriptionListGroup key={label}>
              <DescriptionListTerm aria-label={`${label}-label`}>
                {convertToTitleCase(label)}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {!editable && (
                  <InlineValue role="textbox" aria-label={`${label}-value`}>
                    {value}
                  </InlineValue>
                )}
                {editable && (
                  <Flex spaceItems={{ default: "spaceItemsNone" }}>
                    <FlexItem grow={{ default: "grow" }}>
                      <TextInput
                        aria-label={`${label}-input`}
                        value={value}
                        onChange={(_event, value) => onChange(label)(value)}
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
