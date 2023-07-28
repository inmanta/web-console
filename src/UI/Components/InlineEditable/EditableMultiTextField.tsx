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
import { Maybe } from "@/Core";
import { convertToTitleCase } from "@/UI/Utils";
import {
  CancelEditButton,
  EnableEditButton,
  SubmitEditButton,
} from "./InlineEditButtons";
import { InlineValue } from "./InlineFillers";
import { InlinePlainAlert } from "./InlinePlainAlert";

interface Props {
  groupName: string;
  initialValues: Record<string, string>;
  initiallyEditable?: boolean;
  onSubmit: (
    fieldDescriptors: Record<string, string>,
  ) => Promise<Maybe.Type<string>>;
}

export const EditableMultiTextField: React.FC<Props> = ({
  groupName,
  initialValues,
  initiallyEditable,
  onSubmit,
}) => {
  const [editable, setEditable] = useState(initiallyEditable);
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
                {convertToTitleCase(label)}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {!editable && (
                  <InlineValue aria-label={`${label}-value`}>
                    {value}
                  </InlineValue>
                )}
                {editable && (
                  <Flex spaceItems={{ default: "spaceItemsNone" }}>
                    <FlexItem grow={{ default: "grow" }}>
                      <TextInput
                        aria-label={`${label}-input`}
                        value={value}
                        onChange={onChange(label)}
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
