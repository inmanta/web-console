import React, { useContext, useId, useState } from "react";
import { Language } from "@patternfly/react-code-editor";
import {
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  Label,
  LabelGroup,
  ModalVariant,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
} from "@patternfly/react-core";
import { ResourceActionFilter } from "@/Data/Queries";
import { CodeEditor } from "@/UI/Components/CodeEditor";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { RerunButton } from "./RerunButton";
import { ModelVersionLookup, ScopeRow, ScopeValue, getValueText, isFlag } from "./helpers";

interface Props {
  rows: ScopeRow[];
  resourceFilter: ResourceActionFilter;
  modelVersion: number;
  modelVersionLookup: ModelVersionLookup;
  onRerunStart: () => void;
}

/**
 * The resource filter a dry run was started with, one row per kind of condition, with its values
 * as labels and the rest of a long row behind "+N more". The status row comes last, set apart,
 * since it narrows on a resource's current state rather than defining the scope. The header
 * re-runs the dry run, hides the rows, and opens the exact filter as JSON.
 *
 * @props {Props} props - The props of the component
 *  @prop {ScopeRow[]} rows - The rows of the filter, in display order
 *  @prop {ResourceActionFilter} resourceFilter - The filter the dry run was started with
 *  @prop {number} modelVersion - The model version of the dry run
 *  @prop {ModelVersionLookup} modelVersionLookup - What is known about that model version
 *  @prop {() => void} onRerunStart - Called when a re-run is started
 *
 * @returns {React.FC<Props>} The applied filter panel
 */
export const AppliedFilter: React.FC<Props> = ({
  rows,
  resourceFilter,
  modelVersion,
  modelVersionLookup,
  onRerunStart,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const rowsId = useId();
  const { triggerModal } = useContext(ModalContext);
  const nonStatusRows = rows.filter(({ key }) => key !== "status");
  const statusRows = rows.filter(({ key }) => key === "status");

  const openJson = () =>
    triggerModal({
      title: words("desiredState.complianceCheck.scope.json.title"),
      variant: ModalVariant.medium,
      content: (
        <CodeEditor code={JSON.stringify(resourceFilter, null, 2)} language={Language.json} />
      ),
    });

  return (
    <Panel variant="bordered">
      <PanelHeader>
        <Flex
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <strong>{words("desiredState.complianceCheck.scope.filter.title")}</strong>
          <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
            <RerunButton
              resourceFilter={resourceFilter}
              modelVersion={modelVersion}
              modelVersionLookup={modelVersionLookup}
              onRerunStart={onRerunStart}
            />
            <Divider orientation={{ default: "vertical" }} />
            <Button
              variant="link"
              isInline
              aria-expanded={isExpanded}
              aria-controls={rowsId}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {words(`desiredState.complianceCheck.scope.filter.${isExpanded ? "hide" : "show"}`)}
            </Button>
            <Divider orientation={{ default: "vertical" }} />
            <Button variant="link" isInline onClick={openJson}>
              {words("desiredState.complianceCheck.scope.json")}
            </Button>
          </Flex>
        </Flex>
      </PanelHeader>
      {/* Stays in the DOM while hidden, so the Hide button's aria-controls always points at it. */}
      <div id={rowsId} hidden={!isExpanded}>
        <Divider />
        <PanelMain>
          {/* Less padding above and below than the panel's default, to keep the band compact. */}
          <PanelMainBody style={{ paddingBlock: "var(--pf-t--global--spacer--md)" }}>
            <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
              <RowList rows={nonStatusRows} />
              {statusRows.length > 0 && (
                <>
                  <Divider />
                  <RowList rows={statusRows} />
                </>
              )}
            </Flex>
          </PanelMainBody>
        </PanelMain>
      </div>
    </Panel>
  );
};

/**
 * How many values a filter row shows before the rest collapse into "+N more". Flags (owned
 * services, latest intent) don't count, they are always shown.
 */
const VISIBLE_VALUE_COUNT = 2;

/**
 * Filter rows as a horizontal description list: the row's name as the term, its values as labels.
 *
 * @props {{ rows: ScopeRow[] }} props - The props of the component
 *  @prop {ScopeRow[]} rows - The rows to show, in display order
 *
 * @returns {React.FC<{ rows: ScopeRow[] }>} The row list
 */
const RowList: React.FC<{ rows: ScopeRow[] }> = ({ rows }) => (
  <DescriptionList isHorizontal isCompact termWidth="8ch">
    {rows.map(({ key, values, note }) => {
      const term = words(`desiredState.complianceCheck.scope.row.${key}`);
      const conditionValues = values.filter((value) => !isFlag(value));
      const flags = values.filter(isFlag);

      return (
        // Centered, so the values line up with a two-line term like "Status / transient".
        <DescriptionListGroup key={key} style={{ alignItems: "center" }}>
          <DescriptionListTerm>
            <Flex direction={{ default: "column" }} gap={{ default: "gapNone" }}>
              {term}
              {key === "status" && (
                <Content component="small">
                  {words("desiredState.complianceCheck.scope.row.status.note")}
                </Content>
              )}
            </Flex>
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
              {conditionValues.length > 0 && (
                <LabelGroup
                  numLabels={VISIBLE_VALUE_COUNT}
                  collapsedText={words("desiredState.complianceCheck.scope.filter.more")}
                  aria-label={term}
                >
                  {conditionValues.map((value) => (
                    <ValueLabel key={`${value.kind}-${getValueText(value)}`} value={value} />
                  ))}
                </LabelGroup>
              )}
              {flags.map((value) => (
                <ValueLabel key={getValueText(value)} value={value} />
              ))}
              {note && <Content component="small">{note}</Content>}
            </Flex>
          </DescriptionListDescription>
        </DescriptionListGroup>
      );
    })}
  </DescriptionList>
);

/**
 * One value of a filter row: a service entity in purple, a flag (owned services, latest intent)
 * as a success label, anything else as a plain outline label.
 *
 * @props {{ value: ScopeValue }} props - The props of the component
 *  @prop {ScopeValue} value - The value, with its operator and the filter field it comes from
 *
 * @returns {React.FC<{ value: ScopeValue }>} The value label
 */
const ValueLabel: React.FC<{ value: ScopeValue }> = ({ value }) => {
  const text = getValueText(value);

  if (value.kind === "serviceEntity") {
    return (
      <Label isCompact variant="outline" color="purple">
        {text}
      </Label>
    );
  }
  if (isFlag(value)) {
    return (
      <Label isCompact variant="outline" status="success">
        {text}
      </Label>
    );
  }

  return (
    <Label isCompact variant="outline">
      {text}
    </Label>
  );
};
