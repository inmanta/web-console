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
  Tooltip,
} from "@patternfly/react-core";
import { OutlinedPlayCircleIcon, WrenchIcon } from "@patternfly/react-icons";
import { DeployAgentsAction, ResourceActionFilter, useDeployFiltered } from "@/Data/Queries";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { ResourceActionConfirmModal } from "./ResourceActionConfirmModal";

const iconStyle = { color: "var(--pf-t--global--icon--color--subtle)" };

type ActionKey = keyof typeof DeployAgentsAction;

interface ActionConfig {
  icon: React.ReactNode;
  label: string;
  hint: string;
  tooltip: string;
}

interface BaseProps {
  filter: ResourceActionFilter;
  disabledReason?: string;
}

/**
 * The counts feed the confirm dialog, so they only make sense with requireConfirm. The union keeps
 * them and requireConfirm together: with it both counts are required, without it neither is allowed.
 */
type Props =
  | (BaseProps & { requireConfirm: true; filteredCount: number; environmentCount: number })
  | (BaseProps & { requireConfirm?: false; filteredCount?: never; environmentCount?: never });

/**
 * DeployActions is the shared "Deploy split button".
 *
 * Deploy is the default action; the caret opens a menu repeating Deploy and adding Repair. Both act
 * on the resources matching {@link BaseProps.filter} through the deploy_filtered endpoint, so the same
 * control serves a single resource, the active list filter or a whole environment. With
 * requireConfirm the action opens a confirmation dialog first (letting the operator widen the scope
 * to the whole environment); without it, it runs immediately (the single-resource case). It disables
 * itself while the environment is halted.
 *
 * @Props {Props} - The props of the component
 *  @prop {ResourceActionFilter} filter - The scope the actions act on
 *  @prop {string} [disabledReason] - When set, disables the control and shows this as its tooltip
 *  @prop {boolean} [requireConfirm] - When set, actions open a confirmation dialog before running
 *  @prop {number} [filteredCount] - Resources matching the filter, shown in the confirm dialog (requireConfirm only)
 *  @prop {number} [environmentCount] - Resources in the whole environment, shown in the confirm dialog (requireConfirm only)
 *
 * @returns {React.FC<Props>} The rendered split button
 */
export const DeployActions: React.FC<Props> = (props) => {
  const { filter, disabledReason } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { environmentHandler } = useContext(DependencyContext);
  const { triggerModal, closeModal } = useContext(ModalContext);
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
      tooltip: words("resources.deployActions.deploy.tooltip"),
    },
    repair: {
      icon: <WrenchIcon style={iconStyle} />,
      label: words("resources.compoundStateSummary.repair"),
      hint: words("resources.deployActions.repair.hint"),
      tooltip: words("resources.deployActions.repair.tooltip"),
    },
  };

  const run = (key: ActionKey, scopeFilter: ResourceActionFilter): void => {
    const method = DeployAgentsAction[key];
    const { label } = actions[key];

    deploy.mutate(
      { method, filter: scopeFilter },
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

  const onAction = (key: ActionKey): void => {
    setIsOpen(false);

    if (!props.requireConfirm) {
      run(key, filter);

      return;
    }

    triggerModal({
      title: words("resources.deployActions.confirm.title")(actions[key].label),
      description: words("resources.deployActions.confirm.description"),
      content: (
        <ResourceActionConfirmModal
          actionLabel={actions[key].label}
          filter={filter}
          filteredCount={props.filteredCount}
          environmentCount={props.environmentCount}
          onConfirm={(scopeFilter) => {
            closeModal();
            run(key, scopeFilter);
          }}
          onClose={closeModal}
        />
      ),
    });
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
        <MenuToggleAction
          key="deploy-action"
          isDisabled={isDisabled}
          onClick={() => onAction("deploy")}
        >
          <Tooltip content={actions.deploy.tooltip}>
            <span>
              <OutlinedPlayCircleIcon /> {actions.deploy.label}
            </span>
          </Tooltip>
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
          const { icon, label, hint, tooltip: itemTooltip } = actions[key];

          return (
            <DropdownItem
              key={key}
              icon={icon}
              onClick={() => onAction(key)}
              tooltipProps={{ content: itemTooltip }}
            >
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
