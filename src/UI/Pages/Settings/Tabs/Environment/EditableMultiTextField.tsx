import { Maybe } from "@/Core";
import {
  Alert,
  AlertActionCloseButton,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TextInput,
} from "@patternfly/react-core";
import { CheckIcon, PencilAltIcon, TimesIcon } from "@patternfly/react-icons";
import React, { useState } from "react";
import styled from "styled-components";

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
      setFieldValues(initialValues);
    }
  };
  const onKeyDown = (event) => {
    if (event.key && event.key !== "Enter") return;
    onSubmitRequest(fieldValues);
  };
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        {groupName}
        {!editable && (
          <Button
            aria-label={`${groupName}-toggle-edit`}
            onClick={() => {
              setEditable(true);
              setSubmitError("");
            }}
            variant="plain"
          >
            <PencilAltIcon />
          </Button>
        )}
        {editable && (
          <>
            <Button
              aria-label={`${groupName}-submit-edit`}
              onClick={() => {
                onSubmitRequest(fieldValues);
              }}
              variant="link"
            >
              <CheckIcon />
            </Button>
            <Button
              aria-label={`${groupName}-cancel-edit`}
              onClick={() => {
                setEditable(false);
                setFieldValues(initialValues);
              }}
              variant="plain"
            >
              <TimesIcon />
            </Button>
          </>
        )}
      </DescriptionListTerm>
      {submitError && (
        <WidthLimitedAlert
          aria-label={`${groupName}-error-message`}
          variant="danger"
          isInline
          isPlain
          title={submitError}
          actionClose={
            <AlertActionCloseButton
              aria-label={`${groupName}-close-error`}
              onClick={() => setSubmitError("")}
            />
          }
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

const WidthLimitedAlert = styled(Alert)`
  width: fit-content;
`;
