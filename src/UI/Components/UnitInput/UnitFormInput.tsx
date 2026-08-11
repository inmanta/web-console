import React, { useEffect, useRef, useState } from "react";
import {
  FormGroup,
  FormHelperText,
  FormSelect,
  FormSelectOption,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  TextInput,
} from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";
import { toSubmittableNumber } from "./convert";
import { otherScaleCandidates, selectDisplayUnit } from "./display";
import { familyOf } from "./units";
import { validateUnitInput } from "./validate";
import type { UnitConfig } from "./resolveUnitConfig";
import type { UnitBounds, UnitValidationError } from "./validate";

interface Props {
  attributeName: string;

  /** Visible label; defaults to `attributeName` when omitted. Pass `""` to render no label, e.g. when embedding this component inside a caller's own labeled FormGroup. */
  label?: string;

  /** The current value in API units, or `null` when empty/unset. */
  attributeValue: number | bigint | null;
  description?: string | null;
  isOptional: boolean;
  shouldBeDisabled?: boolean;
  config: UnitConfig;

  /** `validation_parameters` (`ge`/`gt`/`le`/`lt`), expressed in API units. */
  bounds?: UnitBounds;
  handleInputChange: (value: number | bigint | null, event: unknown) => void;

  /** Fires whenever the typed entry's validity changes (e.g. to gate a form's submit button) — an empty, optional field counts as valid, matching `handleInputChange`'s own `null`. */
  onValidityChange?: (isValid: boolean) => void;
}

function initialState(
  attributeValue: number | bigint | null,
  config: UnitConfig
): { unit: string; typed: string } {
  if (attributeValue === null || attributeValue === undefined) {
    return { unit: config.displayUnit, typed: "" };
  }

  const { unit, value } = selectDisplayUnit(attributeValue, config);

  return { unit, typed: value.toFixed() };
}

// Fixed rather than `width: auto` so the control doesn't resize as the user switches between a
// short code ("B") and the catalogue's longest ones ("Kibit/s", "Gibit/s", "Tibit/s" — 7 chars).
// Duration units are spelled out in full (see DURATION_UNIT_LABELS) and need more room to match.
const UnitSelect = styled(FormSelect)<{ $isDuration?: boolean }>`
  width: ${(props) => (props.$isDuration ? "9rem" : "6.5rem")};
`;

// Duration codes read better spelled out than as the catalogue's terse ("min", "h", "d") codes.
const DURATION_UNIT_LABELS: Record<string, string> = {
  ns: words("unitInput.durationUnit.ns"),
  us: words("unitInput.durationUnit.us"),
  ms: words("unitInput.durationUnit.ms"),
  s: words("unitInput.durationUnit.s"),
  min: words("unitInput.durationUnit.min"),
  h: words("unitInput.durationUnit.h"),
  d: words("unitInput.durationUnit.d"),
};

function unitLabel(kind: UnitConfig["kind"], code: string): string {
  return kind === "duration" ? (DURATION_UNIT_LABELS[code] ?? code) : code;
}

function errorMessage(error: UnitValidationError, kind: UnitConfig["kind"]): string {
  switch (error.kind) {
    case "not-a-number":
      return words("unitInput.error.notANumber");
    case "not-exact":
      return words("unitInput.error.notExact")(
        error.entered,
        unitLabel(kind, error.unit),
        error.apiValue.toFixed(),
        unitLabel(kind, error.apiUnit)
      );
    case "bound":
      return words(`unitInput.error.bound.${error.op}`)(
        error.limitInUnit.toFixed(),
        unitLabel(kind, error.unit)
      );
  }
}

/**
 * Standalone form input for quantities with a unit (sizes, data rates, durations) — see issue
 * #7022. The form/submitted value always stays in API units; the selected display unit and typed
 * text are local UI state. Not yet wired into `FieldCreator`/`FieldInput` (#7133) or read-only
 * views (#7132) — this is the reusable component those will consume.
 */
export const UnitFormInput: React.FC<Props> = ({
  attributeName,
  label,
  attributeValue,
  description,
  isOptional,
  config,
  bounds,
  shouldBeDisabled = false,
  handleInputChange,
  onValidityChange,
}) => {
  const [{ unit, typed }, setState] = useState(() => initialState(attributeValue, config));
  const editedRef = useRef(false);

  // Mirrors TextFormInput's convention: re-derive the displayed state from an externally changed
  // `attributeValue` (form reset, duplicate-prefill), but never while the user is mid-edit.
  useEffect(() => {
    if (!editedRef.current) {
      setState(initialState(attributeValue, config));
    }
  }, [attributeValue, config]);

  const validation = validateUnitInput(typed, unit, config, bounds);
  const error = !validation.valid ? validation.error : null;

  useEffect(() => {
    onValidityChange?.(validation.valid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.valid]);

  const commit = (nextTyped: string, nextUnit: string) => {
    editedRef.current = true;
    setState({ typed: nextTyped, unit: nextUnit });

    const result = validateUnitInput(nextTyped, nextUnit, config, bounds);

    handleInputChange(
      result.valid && result.apiValue !== null ? toSubmittableNumber(result.apiValue) : null,
      null
    );
  };

  const otherScale = otherScaleCandidates(config, unit);
  const equivalent =
    validation.valid && validation.apiValue !== null && otherScale.length > 0
      ? selectDisplayUnit(validation.apiValue, { ...config, offeredUnits: otherScale })
      : null;
  const equivalentFamily =
    equivalent && familyOf(config.kind, equivalent.unit) === "iec" ? "binary" : "metric";

  return (
    <FormGroup isRequired={!isOptional} fieldId={attributeName} label={label ?? attributeName}>
      {description && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem>{description}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            type="number"
            step={1}
            id={attributeName}
            name={attributeName}
            aria-label={`UnitInput-${attributeName}`}
            aria-describedby={`${attributeName}-helper`}
            value={typed}
            placeholder={isOptional ? "—" : "0"}
            isRequired={!isOptional}
            isDisabled={shouldBeDisabled}
            validated={error ? "error" : "default"}
            onChange={(_event, value) => commit(value, unit)}
          />
        </InputGroupItem>
        <InputGroupItem>
          <UnitSelect
            aria-label={words("unitInput.unitSelect.ariaLabel")}
            value={unit}
            isDisabled={shouldBeDisabled}
            $isDuration={config.kind === "duration"}
            onChange={(_event, value) => commit(typed, value)}
          >
            {config.offeredUnits.map((code) => (
              <FormSelectOption key={code} value={code} label={unitLabel(config.kind, code)} />
            ))}
          </UnitSelect>
        </InputGroupItem>
      </InputGroup>
      <FormHelperText>
        <HelperText id={`${attributeName}-helper`}>
          {error ? (
            <HelperTextItem variant="error">{errorMessage(error, config.kind)}</HelperTextItem>
          ) : (
            validation.valid &&
            validation.apiValue !== null && (
              <>
                <HelperTextItem>
                  {words("unitInput.helper.stored")(
                    validation.apiValue.toFixed(),
                    unitLabel(config.kind, config.apiUnit)
                  )}
                </HelperTextItem>
                {equivalent && (
                  <HelperTextItem variant="indeterminate">
                    {words("unitInput.helper.equivalent")(
                      equivalent.value.toFixed(),
                      unitLabel(config.kind, equivalent.unit),
                      equivalentFamily
                    )}
                  </HelperTextItem>
                )}
              </>
            )
          )}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
