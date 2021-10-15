import React, { useState } from "react";
// import inlineStyles from "@patternfly/react-styles/css/components/InlineEdit/inline-edit";
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TextInput,
} from "@patternfly/react-core";
import { CheckIcon, PencilAltIcon, TimesIcon } from "@patternfly/react-icons";

interface Props {
  label: string;
  initialValue: string;
  onSubmit: (value: string) => void;
}

export const EditableTextField: React.FC<Props> = ({
  label,
  initialValue,
  onSubmit,
}) => {
  const [editable, setEditable] = useState(false);
  const [value, setValue] = useState(initialValue);
  const onKeyDown = (event) => {
    if (event.key && event.key !== "Enter") return;
    setEditable(false);
    onSubmit(value);
  };
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {label}
          {!editable && (
            <Button onClick={() => setEditable(true)} variant="plain">
              <PencilAltIcon />
            </Button>
          )}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {!editable && <span>{value}</span>}
          {editable && (
            <Flex spaceItems={{ default: "spaceItemsNone" }}>
              <FlexItem>
                <TextInput
                  value={value}
                  onChange={setValue}
                  onKeyDown={onKeyDown}
                />
              </FlexItem>
              <FlexItem>
                <Button
                  onClick={() => {
                    setEditable(false);
                    onSubmit(value);
                  }}
                  variant="plain"
                >
                  <CheckIcon />
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  onClick={() => {
                    setEditable(false);
                    setValue(initialValue);
                  }}
                  variant="plain"
                >
                  <TimesIcon />
                </Button>
              </FlexItem>
            </Flex>
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};
