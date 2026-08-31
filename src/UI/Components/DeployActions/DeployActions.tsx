import React, { useContext, useState } from "react";
import {
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
} from "@patternfly/react-core";
import { OutlinedPlayCircleIcon, WrenchIcon } from "@patternfly/react-icons";
import { DeployAgentsAction, ResourceActionFilter, useDeployFiltered } from "@/Data/Queries";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";

const iconStyle = { color: "var(--pf-t--global--icon--color--subtle)" };

// The keys match the DeployAgentsAction members, so DeployAgentsAction[key] gives the
// trigger method. Dry run joins the menu with #7243.
type ActionKey = "deploy" | "repair";

interface ActionConfig {
  icon: React.ReactNode;
  label: string;
  hint: string;
}

interface Props {
  filter: ResourceActionFilter;
  disabledReason?: string;
}

/**
 * DeployActions is the shared "Deploy split button".
 *
 * Deploy is the default action; the caret opens a menu repeating Deploy and adding Repair. Both act
 * on the resources matching {@link Props.filter} through the deploy_filtered endpoint, so the same
 * control serves a single resource, the active list filter or a whole environment. It disables
 * itself while the environment is halted. (Dry run joins the menu with #7243.)
 *
 * @Props {Props} - The props of the component
 *  @prop {ResourceActionFilter} filter - The scope the actions act on
 *  @prop {string} [disabledReason] - When set, disables the control and shows this as its tooltip
 *
 * @returns {React.FC<Props>} The rendered split button
 */
export const DeployActions: React.FC<Props> = ({ filter, disabledReason }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifySuccess, notifyError } = useAppAlert();

  const deploy = useDeployFiltered();

  const tooltip = isHalted ? words("environment.halt.tooltip") : disabledReason;
  const isDisabled = deploy.isPending || Boolean(tooltip);

  const actions: Record<ActionKey, ActionConfig> = {
    deploy: {
      icon: <OutlinedPlayCircleIcon style={iconStyle} />,
      label: words("resources.compoundStateSummary.deploy"),
      hint: words("resources.deployActions.deploy.hint"),
    },
    repair: {
      icon: <WrenchIcon style={iconStyle} />,
      label: words("resources.compoundStateSummary.repair"),
      hint: words("resources.deployActions.repair.hint"),
    },
  };

  const run = (key: ActionKey) => {
    const method = DeployAgentsAction[key];
    const { label } = actions[key];

    setIsOpen(false);
    deploy.mutate(
      { method, filter },
      {
        onSuccess: () => notifySuccess({ title: words("resources.deployActions.success")(label) }),
        onError: (error) =>
          notifyError({
            title: words("resources.deployActions.failed")(label),
            message: error.message,
          }),
      }
    );
  };

  const toggle = (ref: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={ref}
      variant="secondary"
      isExpanded={isOpen}
      isDisabled={isDisabled}
      onClick={() => setIsOpen(!isOpen)}
      aria-label={words("resources.deployActions.toggle")}
      splitButtonItems={[
        <MenuToggleAction key="deploy-action" isDisabled={isDisabled} onClick={() => run("deploy")}>
          <OutlinedPlayCircleIcon /> {actions.deploy.label}
        </MenuToggleAction>,
      ]}
    />
  );

  const dropdown = (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      toggle={toggle}
      popperProps={{ position: "right" }}
    >
      <DropdownList>
        {(Object.keys(actions) as ActionKey[]).map((key) => {
          const { icon, label, hint } = actions[key];

          return (
            <DropdownItem key={key} icon={icon} onClick={() => run(key)}>
              <Flex
                justifyContent={{ default: "justifyContentSpaceBetween" }}
                alignItems={{ default: "alignItemsCenter" }}
                columnGap={{ default: "columnGapMd" }}
              >
                <FlexItem>{label}</FlexItem>
                <FlexItem>
                  <Content component="small">{hint}</Content>
                </FlexItem>
              </Flex>
            </DropdownItem>
          );
        })}
      </DropdownList>
    </Dropdown>
  );

  return tooltip ? (
    <ActionDisabledTooltip testingId="DeployActions" tooltipContent={tooltip} isDisabled>
      {dropdown}
    </ActionDisabledTooltip>
  ) : (
    dropdown
  );
};
