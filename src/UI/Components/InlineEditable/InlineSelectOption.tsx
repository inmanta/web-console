import { Maybe } from "@/Core";
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Select,
  SelectOption,
} from "@patternfly/react-core";
import React, { useState } from "react";
import {
  CancelEditButton,
  EnableEditButton,
  SubmitEditButton,
} from "./InlineEditButtons";
import {
  InlineEditButtonFiller,
  InlineLabelItem,
  InlineValue,
} from "./InlineFillers";
import { InlinePlainAlert } from "./InlinePlainAlert";

interface Props {
  label: string;
  initialValue: string;
  options: string[];
  isRequired?: boolean;
  onCreate: (name: string) => Promise<Maybe.Type<string>>;
  onSubmit: (value: string) => void;
}

export const InlineSelectOption: React.FC<Props> = ({
  label,
  initialValue,
  options,
  isRequired,
  onCreate,
  onSubmit,
}) => {
  const [editable, setEditable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(initialValue);
  const [submitError, setSubmitError] = useState("");
  const onSelect = (event, selection) => {
    setSelected(selection);
    setIsOpen(false);
  };
  const onCreateOption = async (newValue: string) => {
    const result = await onCreate(newValue);
    if (Maybe.isSome(result)) {
      setSubmitError(result.value);
      setSelected("");
    }
  };
  const onEditClick = () => {
    setEditable(true);
    setSubmitError("");
  };
  const onCloseAlert = () => setSubmitError("");
  const onSubmitClick = () => {
    setEditable(false);
    onSubmit(selected);
  };
  const onCancelEditClick = () => {
    setEditable(false);
    setSelected(initialValue);
  };
  return (
    <>
      <DescriptionListGroup key={label}>
        <DescriptionListTerm>
          <Flex
            direction={{ default: "row" }}
            spaceItems={{ default: "spaceItemsNone" }}
          >
            <InlineLabelItem aria-label={`${label}-label`}>
              {label}
              {isRequired && (
                <span aria-hidden="true" style={{ color: "red" }}>
                  {" "}
                  *
                </span>
              )}
            </InlineLabelItem>
            <FlexItem>
              {!editable ? (
                <EnableEditButton
                  aria-label={`${label}-toggle-edit`}
                  onClick={onEditClick}
                />
              ) : (
                <InlineEditButtonFiller />
              )}
            </FlexItem>
          </Flex>
        </DescriptionListTerm>
        {submitError && (
          <InlinePlainAlert
            aria-label={`${label}-error-message`}
            errorMessage={submitError}
            closeButtonAriaLabel={`${label}-close-error`}
            onCloseAlert={onCloseAlert}
          />
        )}
        <DescriptionListDescription>
          {!editable && (
            <InlineValue aria-label={`${label}-value`}>{selected}</InlineValue>
          )}
          {editable && (
            <Flex spaceItems={{ default: "spaceItemsNone" }}>
              <FlexItem>
                <Select
                  aria-label={`${label}-select-input`}
                  toggleAriaLabel={`${label}-select-toggle`}
                  typeAheadAriaLabel={`${label}-typeahead`}
                  variant="typeahead"
                  onToggle={() => {
                    setIsOpen(!isOpen);
                  }}
                  isOpen={isOpen}
                  onSelect={onSelect}
                  selections={selected}
                  isCreatable
                  onCreateOption={onCreateOption}
                >
                  {options.map((option) => (
                    <SelectOption key={option} value={option} />
                  ))}
                </Select>
              </FlexItem>
              <FlexItem>
                <SubmitEditButton
                  aria-label={`${label}-submit-edit`}
                  onClick={onSubmitClick}
                />
              </FlexItem>
              <FlexItem>
                <CancelEditButton
                  aria-label={`${label}-cancel-edit`}
                  onClick={onCancelEditClick}
                />
              </FlexItem>
            </Flex>
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};
