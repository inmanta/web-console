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
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { ResourceActionConfirmModal, ResourceActionScope } from "./ResourceActionConfirmModal";

const iconStyle = { color: "var(--pf-t--global--icon--color--subtle)" };

type ActionKey = keyof typeof DeployAgentsAction;

interface ActionConfig {
  icon: React.ReactNode;
  label: string;
  hint: string;
}

interface Props {
  filter: ResourceActionFilter;
  requireConfirm?: boolean;
  scopes?: ResourceActionScope[];
  disabledReason?: string;
}

/**
 * ResourceActions is the shared split button for running an action on a set of resources.
 *
 * Deploy is the default action; the caret opens a menu repeating Deploy and adding Repair. Both act
 * on the resources matching {@link Props.filter} through the deploy_filtered endpoint, so the same
 * control serves a single resource, the active list filter, a whole environment or a service
 * instance. With {@link Props.requireConfirm} the action opens a confirmation dialog first, where
 * the operator picks one of {@link Props.scopes}; without it, it runs immediately against
 * {@link Props.filter} (the single-resource case). It disables itself while the environment is halted.
 *
 * @Props {Props} - The props of the component
 *  @prop {ResourceActionFilter} filter - The scope acted on when no confirmation is required
 *  @prop {boolean} [requireConfirm] - When set, actions open a confirmation dialog before running
 *  @prop {ResourceActionScope[]} [scopes] - The scopes offered in the confirm dialog (first is the default)
 *  @prop {string} [disabledReason] - When set, disables the control and shows this as its tooltip
 *
 * @returns {React.FC<Props>} The rendered split button
 */
export const ResourceActions: React.FC<Props> = ({
  filter,
  requireConfirm,
  scopes,
  disabledReason,
}) => {
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
      hint: words("resources.resourceActions.deploy.hint"),
    },
    repair: {
      icon: <WrenchIcon style={iconStyle} />,
      label: words("resources.compoundStateSummary.repair"),
      hint: words("resources.resourceActions.repair.hint"),
    },
  };

  const run = (key: ActionKey, scopeFilter: ResourceActionFilter) => {
    const method = DeployAgentsAction[key];
    const { label } = actions[key];

    deploy.mutate(
      { method, filter: scopeFilter },
      {
        onSuccess: () =>
          notifySuccess({ title: words("resources.resourceActions.success")(label) }),
        onError: (error) =>
          notifyError({
            title: words("resources.resourceActions.failed")(label),
            message: error.message,
          }),
      }
    );
  };

  const onAction = (key: ActionKey) => {
    setIsOpen(false);

    if (!requireConfirm) {
      run(key, filter);

      return;
    }

    triggerModal({
      title: words("resources.resourceActions.confirm.title")(actions[key].label),
      description: words("resources.resourceActions.confirm.description"),
      content: (
        <ResourceActionConfirmModal
          actionLabel={actions[key].label}
          scopes={scopes ?? [{ id: "filter", title: actions[key].label, filter }]}
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
      aria-label={words("resources.resourceActions.toggle")}
      splitButtonItems={[
        <MenuToggleAction
          key="deploy-action"
          isDisabled={isDisabled}
          onClick={() => onAction("deploy")}
        >
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
            <DropdownItem key={key} icon={icon} onClick={() => onAction(key)}>
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
    <ActionDisabledTooltip testingId="ResourceActions" tooltipContent={tooltip} isDisabled>
      {dropdown}
    </ActionDisabledTooltip>
  ) : (
    dropdown
  );
};
