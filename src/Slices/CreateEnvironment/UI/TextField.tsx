import React from "react";
import { Button, FormGroup, TextInput, Tooltip } from "@patternfly/react-core";
import { HelpIcon } from "@patternfly/react-icons";

interface Props {
  label: string;
  isRequired?: boolean;
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
}

export const TextField: React.FC<Props> = ({ label, isRequired, value, onChange, tooltip }) => {
  return (
    <FormGroup
      fieldId={label}
      label={label}
      isRequired={isRequired}
      labelHelp={
        tooltip ? (
          <Tooltip content={tooltip}>
            <Button
              variant="plain"
              type="button"
              icon={<HelpIcon />}
              aria-label={`More info for ${label} field`}
              onClick={(e) => e.preventDefault()}
            />
          </Tooltip>
        ) : undefined
      }
    >
      <TextInput
        aria-label={`${label}-input`}
        value={value}
        onChange={(_event, value) => onChange(value)}
      />
    </FormGroup>
  );
};
