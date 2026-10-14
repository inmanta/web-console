import React, { useContext, useId, useState } from "react";
import { Language } from "@patternfly/react-code-editor";
import {
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  Label,
  LabelGroup,
  LabelProps,
  ModalVariant,
} from "@patternfly/react-core";
import { ResourceActionFilter } from "@/Core";
import { CodeEditor } from "@/UI/Components/CodeEditor";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { RerunButton } from "./RerunButton";
import { getValueText, isFlag } from "./helpers";
import { FilterRow, FilterValue, ModelVersionState } from "./types";

interface Props {
  rows: FilterRow[];
  resourceFilter: ResourceActionFilter;
  modelVersion: number;
  modelVersionState: ModelVersionState;
  onRerunStart: () => void;
}

/**
 * The resource filter a dry run was started with, as an expandable card: one row per kind of
 * condition, with its values as labels and the rest of a long row behind "+N more". Rows that are
 * set apart, like the status row, come last below a divider. The header re-runs the dry run and
 * opens the exact filter as JSON.
 *
 * @props {Props} props - The props of the component
 *  @prop {FilterRow[]} rows - The rows of the filter, in display order
 *  @prop {ResourceActionFilter} resourceFilter - The filter the dry run was started with
 *  @prop {number} modelVersion - The model version of the dry run
 *  @prop {ModelVersionState} modelVersionState - What is known about that model version
 *  @prop {() => void} onRerunStart - Called when a re-run is started
 *
 * @returns {React.FC<Props>} The applied filter card
 */
export const AppliedFilter: React.FC<Props> = ({
  rows,
  resourceFilter,
  modelVersion,
  modelVersionState,
  onRerunStart,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const titleId = useId();
  const { triggerModal } = useContext(ModalContext);
  const scopeRows = rows.filter(({ isApart }) => !isApart);
  const apartRows = rows.filter(({ isApart }) => isApart);

  const openJSON = () =>
    triggerModal({
      title: words("desiredState.complianceCheck.scope.json.title"),
      variant: ModalVariant.medium,
      content: (
        <CodeEditor code={JSON.stringify(resourceFilter, null, 2)} language={Language.json} />
      ),
    });

  return (
    <Card isCompact isExpanded={isExpanded} variant="secondary">
      <CardHeader
        onExpand={() => setIsExpanded(!isExpanded)}
        toggleButtonProps={{ "aria-labelledby": titleId, "aria-expanded": isExpanded }}
        actions={{
          hasNoOffset: true,
          actions: (
            <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
              <RerunButton
                resourceFilter={resourceFilter}
                modelVersion={modelVersion}
                modelVersionState={modelVersionState}
                onRerunStart={onRerunStart}
              />
              <Divider orientation={{ default: "vertical" }} />
              <Button variant="link" isInline onClick={openJSON}>
                {words("desiredState.complianceCheck.scope.json")}
              </Button>
            </Flex>
          ),
        }}
      >
        <CardTitle id={titleId}>
          {words("desiredState.complianceCheck.scope.filter.title")}
        </CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
            <RowList rows={scopeRows} />
            {apartRows.length > 0 && (
              <>
                <Divider />
                <RowList rows={apartRows} />
              </>
            )}
          </Flex>
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

/**
 * Filter rows as a horizontal description list: the row's name as the term, with its note under
 * it, and its values as labels.
 *
 * @props {{ rows: FilterRow[] }} props - The props of the component
 *  @prop {FilterRow[]} rows - The rows to show, in display order
 *
 * @returns {React.FC<{ rows: FilterRow[] }>} The row list
 */
const RowList: React.FC<{ rows: FilterRow[] }> = ({ rows }) => (
  <DescriptionList isHorizontal isCompact termWidth="8ch">
    {rows.map(({ key, values, note, termNote }) => {
      const term = words(`desiredState.complianceCheck.scope.row.${key}`);
      const conditionValues = values.filter((value) => !isFlag(value));
      const flags = values.filter(isFlag);

      return (
        <DescriptionListGroup key={key} style={{ alignItems: "center" }}>
          <DescriptionListTerm>
            <Flex direction={{ default: "column" }} gap={{ default: "gapNone" }}>
              {term}
              {termNote && <Content component="small">{termNote}</Content>}
            </Flex>
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
              {conditionValues.length > 0 && (
                <LabelGroup
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
 * The color of a value's label: purple for a service entity, success for a flag (owned services,
 * latest intent), none for anything else.
 *
 * @example getValueLabelColor({ value: "l2Connect", kind: "serviceEntity" }) // { color: "purple" }
 */
const getValueLabelColor = (value: FilterValue): Pick<LabelProps, "color" | "status"> => {
  if (value.kind === "serviceEntity") {
    return { color: "purple" };
  }
  if (isFlag(value)) {
    return { status: "success" };
  }

  return {};
};

/**
 * One value of a filter row, as an outline label in the color of its kind.
 *
 * @props {{ value: FilterValue }} props - The props of the component
 *  @prop {FilterValue} value - The value, with its operator and the filter field it comes from
 *
 * @returns {React.FC<{ value: FilterValue }>} The value label
 */
const ValueLabel: React.FC<{ value: FilterValue }> = ({ value }) => (
  <Label isCompact variant="outline" {...getValueLabelColor(value)}>
    {getValueText(value)}
  </Label>
);
