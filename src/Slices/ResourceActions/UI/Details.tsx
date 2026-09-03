import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { TextWithCopy } from "@/UI/Components";
import { CustomDatePresenter } from "@/UI/Utils";
import { getResourceIdFromResourceVersionId } from "@/UI/Utils/ResourceId";
import { words } from "@/UI/words";
import { getDeployReasonText } from "@S/ResourceActions/Core/DeployReason";
import { ResourceAction } from "@S/ResourceActions/Core/Domain";
import { ResourceLogsLink } from "./ResourceLogsLink";

interface Props {
  action: ResourceAction;
}

const datePresenter = new CustomDatePresenter();

const copyTooltip = () => words("attribute.value.copy");

const CopyValue: React.FC<{ value: string }> = ({ value }) => (
  <TextWithCopy value={value} tooltipContent={copyTooltip()} />
);

/**
 * The expanded content of a changelog row: the fields of the resource action,
 * each copy-pastable, together with a link to the resource's filtered logs.
 *
 * @props {Props} props - The props of the component.
 *  @prop {ResourceAction} action - The resource action to detail.
 * @returns {React.FC<Props>} The details component.
 */
export const Details: React.FC<Props> = ({ action }) => {
  const reason = getDeployReasonText(action);
  const duration = action.finished ? datePresenter.diff(action.finished, action.started) : "-";

  return (
    <Stack hasGutter>
      <StackItem>
        <DescriptionList isHorizontal isCompact aria-label="ResourceAction-Details">
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.actionId")}</DescriptionListTerm>
            <DescriptionListDescription>
              <CopyValue value={action.action_id} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.version")}</DescriptionListTerm>
            <DescriptionListDescription>
              <CopyValue value={String(action.version)} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.type")}</DescriptionListTerm>
            <DescriptionListDescription>
              <CopyValue value={action.action} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.status")}</DescriptionListTerm>
            <DescriptionListDescription>
              {action.status ? <CopyValue value={action.status} /> : "-"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.outcome")}</DescriptionListTerm>
            <DescriptionListDescription>
              {action.change ? <CopyValue value={action.change} /> : "-"}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.started")}</DescriptionListTerm>
            <DescriptionListDescription>
              <CopyValue value={datePresenter.getFull(action.started)} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.finished")}</DescriptionListTerm>
            <DescriptionListDescription>
              {action.finished ? (
                <CopyValue value={datePresenter.getFull(action.finished)} />
              ) : (
                "-"
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.duration")}</DescriptionListTerm>
            <DescriptionListDescription>
              <CopyValue value={duration} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          {reason && (
            <DescriptionListGroup>
              <DescriptionListTerm>{words("resourceActions.column.reason")}</DescriptionListTerm>
              <DescriptionListDescription>
                <CopyValue value={reason} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.resources")}</DescriptionListTerm>
            <DescriptionListDescription>
              <Stack hasGutter>
                {action.resource_version_ids.map((id) => (
                  <StackItem key={id}>
                    <CopyValue value={id} />
                    <ResourceLogsLink
                      resourceId={getResourceIdFromResourceVersionId(id)}
                      action={action.action}
                      started={action.started}
                      finished={action.finished}
                    />
                  </StackItem>
                ))}
              </Stack>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};
