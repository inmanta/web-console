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
import { ResourceActionConfirmModal } from "./ResourceActionConfirmModal";

/** Muted, outlined look so the menu icons read as hints rather than solid black glyphs. */
const iconStyle = { color: "var(--pf-t--global--icon--color--subtle)" };

// Dry run is intentionally absent: it targets a specific version and its result opens in the
// Compliance Check report, which is separate work (design section 06, issue #7243).
type ActionKey = "deploy" | "repair";

interface Props {
  filter: ResourceActionFilter;
  requireConfirm?: boolean;
  disabledReason?: string;
}

interface ActionItem {
  key: ActionKey;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}

/**
 * DeployActions is the shared "Deploy split button".
 *
 * Deploy is the default action; the caret opens a menu repeating Deploy and adding Repair. Both act
 * on the resources matching {@link Props.filter} through the deploy_filtered endpoint, so the same
 * control serves a single resource, the active list filter or a whole environment. With
 * {@link Props.requireConfirm} the action opens a confirmation dialog first (letting the operator
 * widen the scope to the whole environment); without it, it runs immediately (the single-resource
 * case). It disables itself while the environment is halted. (Dry run joins the menu with #7243.)
 *
 * @Props {Props} - The props of the component
 *  @prop {ResourceActionFilter} filter - The scope the actions act on
 *  @prop {boolean} [requireConfirm] - When set, actions open a confirmation dialog before running
 *  @prop {string} [disabledReason] - When set, disables the control and shows this as its tooltip
 *
 * @returns {React.FC<Props>} The rendered split button
 */
export const DeployActions: React.FC<Props> = ({ filter, requireConfirm, disabledReason }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState<ActionKey | null>(null);
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifySuccess, notifyError } = useAppAlert();

  const deploy = useDeployFiltered();

  // Halted takes precedence over any caller-supplied reason (e.g. an orphaned resource).
  const tooltip = isHalted ? words("environment.halt.tooltip") : disabledReason;
  const isDisabled = deploy.isPending || Boolean(tooltip);

  const labelOf = (key: ActionKey): string =>
    key === "deploy"
      ? words("resources.compoundStateSummary.deploy")
      : words("resources.compoundStateSummary.repair");

  const run = (key: ActionKey, scopeFilter: ResourceActionFilter) => {
    const method = key === "deploy" ? DeployAgentsAction.deploy : DeployAgentsAction.repair;
    const label = labelOf(key);

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

  const onAction = (key: ActionKey) => {
    setIsOpen(false);
    if (requireConfirm) {
      setPending(key);
    } else {
      run(key, filter);
    }
  };

  const items: ActionItem[] = [
    {
      key: "deploy",
      icon: <OutlinedPlayCircleIcon style={iconStyle} />,
      label: words("resources.compoundStateSummary.deploy"),
      hint: words("resources.deployActions.deploy.hint"),
    },
    {
      key: "repair",
      icon: <WrenchIcon style={iconStyle} />,
      label: words("resources.compoundStateSummary.repair"),
      hint: words("resources.deployActions.repair.hint"),
    },
  ];

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
          <OutlinedPlayCircleIcon /> {words("resources.compoundStateSummary.deploy")}
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
        {items.map((item) => (
          <DropdownItem key={item.key} icon={item.icon} onClick={() => onAction(item.key)}>
            <Flex
              justifyContent={{ default: "justifyContentSpaceBetween" }}
              alignItems={{ default: "alignItemsCenter" }}
              columnGap={{ default: "columnGapMd" }}
            >
              <FlexItem>{item.label}</FlexItem>
              {item.hint && (
                <FlexItem>
                  <Content component="small">{item.hint}</Content>
                </FlexItem>
              )}
            </Flex>
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );

  return (
    <>
      {tooltip ? (
        <ActionDisabledTooltip testingId="DeployActions" tooltipContent={tooltip} isDisabled>
          {dropdown}
        </ActionDisabledTooltip>
      ) : (
        dropdown
      )}
      {pending && (
        <ResourceActionConfirmModal
          actionLabel={labelOf(pending)}
          filter={filter}
          onConfirm={(scopeFilter) => {
            run(pending, scopeFilter);
            setPending(null);
          }}
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
};
