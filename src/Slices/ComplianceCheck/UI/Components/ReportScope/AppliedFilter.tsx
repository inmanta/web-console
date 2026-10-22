import React, { PropsWithChildren, useContext, useId, useState } from "react";
import { Language } from "@patternfly/react-code-editor";
import {
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Content,
  Divider,
  Flex,
  Label,
  LabelGroup,
  LabelProps,
  ModalVariant,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Tr } from "@patternfly/react-table";
import { DryRunContext, ResourceActionFilter, words } from "@/Core";
import { CodeEditor } from "@/UI/Components/CodeEditor";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { RerunButton } from "./RerunButton";
import { createVersionValues, formatFilterValue, isFlag } from "./helpers";
import { FilterRow, FilterValue } from "./types";

interface Props {
  rows: FilterRow[];
  statusValues: FilterValue[];
  resourceFilter: ResourceActionFilter;
  context?: DryRunContext | null;
  modelVersion: number;
  modelVersionStatus: DesiredStateVersionStatus | undefined;
  onRerunStart: () => void;
}

/**
 * The resource filter a dry run was started with, as an expandable card with a compact table: one
 * row per kind of condition, with its values as labels and the rest of a long row behind
 * "+N more". The version row follows the filter rows, and the status row, whose conditions
 * describe a moment rather than the scope, comes last and shaded. The header re-runs the dry run
 * and opens the exact filter as JSON.
 *
 * @props {Props} props - The props of the component
 *  @prop {FilterRow[]} rows - The filter rows, in display order
 *  @prop {FilterValue[]} statusValues - The values of the status row
 *  @prop {ResourceActionFilter} resourceFilter - The filter the dry run was started with
 *  @prop {DryRunContext | null} [context] - The context the dry run was started with, to store
 *    with a re-run
 *  @prop {number} modelVersion - The model version of the dry run
 *  @prop {DesiredStateVersionStatus | undefined} modelVersionStatus - The status of that model
 *    version, undefined until it is known
 *  @prop {() => void} onRerunStart - Called when a re-run is started
 *
 * @returns {React.FC<Props>} The applied filter card
 */
export const AppliedFilter: React.FC<Props> = ({
  rows,
  statusValues,
  resourceFilter,
  context,
  modelVersion,
  modelVersionStatus,
  onRerunStart,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const titleId = useId();
  const { triggerModal } = useContext(ModalContext);
  const title = words("desiredState.complianceCheck.scope.filter.title");
  const versionTerm = words("desiredState.complianceCheck.scope.row.version");
  const versionValues = createVersionValues(resourceFilter, modelVersion, modelVersionStatus);
  const statusTerm = words("desiredState.complianceCheck.scope.row.status");

  const openJSON = () =>
    triggerModal({
      title: words("desiredState.complianceCheck.scope.json.title"),
      variant: ModalVariant.medium,
      content: (
        <CodeEditor code={JSON.stringify(resourceFilter, null, 2)} language={Language.json} />
      ),
    });

  return (
    <Card isCompact isExpanded={isExpanded}>
      <CardHeader
        onExpand={() => setIsExpanded(!isExpanded)}
        toggleButtonProps={{ "aria-labelledby": titleId, "aria-expanded": isExpanded }}
        actions={{
          hasNoOffset: true,
          actions: (
            <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
              <RerunButton
                resourceFilter={resourceFilter}
                context={context}
                modelVersion={modelVersion}
                modelVersionStatus={modelVersionStatus}
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
        <CardTitle id={titleId}>{title}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          <Table variant="compact" aria-label={title}>
            <Tbody>
              {rows.map(({ key, values }) => {
                const term = words(`desiredState.complianceCheck.scope.row.${key}`);

                return (
                  <Tr key={key}>
                    <Th scope="row" modifier="fitContent">
                      {term}
                    </Th>
                    <Td>
                      <ValueLabels term={term} values={values} />
                    </Td>
                  </Tr>
                );
              })}
              {versionValues.length > 0 && (
                <Tr>
                  <Th scope="row" modifier="fitContent">
                    {versionTerm}
                  </Th>
                  <Td>
                    <ValueLabels term={versionTerm} values={versionValues}>
                      {resourceFilter.isOrphan === false && (
                        <Content component="small">
                          {words("desiredState.complianceCheck.scope.value.excludesOrphans")}
                        </Content>
                      )}
                    </ValueLabels>
                  </Td>
                </Tr>
              )}
              {statusValues.length > 0 && (
                <Tr isStriped>
                  <Th scope="row" modifier="fitContent">
                    <Flex direction={{ default: "column" }} gap={{ default: "gapNone" }}>
                      {statusTerm}
                      <Content component="small">
                        {words("desiredState.complianceCheck.scope.row.status.note")}
                      </Content>
                    </Flex>
                  </Th>
                  <Td>
                    <ValueLabels term={statusTerm} values={statusValues} />
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

/**
 * The values of one row as labels: the conditions in a label group that collapses after a few,
 * then the flags, which always show, then any note the row passes as children.
 *
 * @props {PropsWithChildren<{ term: string; values: FilterValue[] }>} props - The props of the component
 *  @prop {string} term - The name of the row, to label the group
 *  @prop {FilterValue[]} values - The values of the row
 *  @prop {React.ReactNode} children - A note after the values
 *
 * @returns {React.FC<PropsWithChildren<{ term: string; values: FilterValue[] }>>} The value labels
 */
const ValueLabels: React.FC<PropsWithChildren<{ term: string; values: FilterValue[] }>> = ({
  term,
  values,
  children,
}) => {
  const conditionValues = values.filter((value) => !isFlag(value));
  const flags = values.filter(isFlag);

  return (
    <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
      {conditionValues.length > 0 && (
        <LabelGroup
          collapsedText={words("desiredState.complianceCheck.scope.filter.more")}
          aria-label={term}
        >
          {/* Two values can show the same text (e.g. two instances with the same label), so the
              index keeps the keys unique. The list is fixed per report. */}
          {conditionValues.map((value, index) => (
            <ValueLabel key={`${index}-${formatFilterValue(value)}`} value={value} />
          ))}
        </LabelGroup>
      )}
      {flags.map((value) => (
        <ValueLabel key={formatFilterValue(value)} value={value} />
      ))}
      {children}
    </Flex>
  );
};

/**
 * Creates the color props of a value's label: purple for a service entity, success for a flag
 * (owned services, latest intent), none for anything else.
 *
 * @example createValueLabelProps({ value: "l2Connect", kind: "serviceEntity" }) // { color: "purple" }
 */
const createValueLabelProps = (value: FilterValue): Pick<LabelProps, "color" | "status"> => {
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
  <Label isCompact variant="outline" {...createValueLabelProps(value)}>
    {formatFilterValue(value)}
  </Label>
);
