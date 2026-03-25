import React from "react";
import { Switch, Tooltip } from "@patternfly/react-core";
import { usePauseAgent } from "@/Data/Queries";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";

interface Props {
  name: string;
  unpauseOnResume?: boolean | null;
}

/**
 * OnResumeToggle - component that allows users to control the behavior of an agent
 * when it environment resumes. The toggle determines whether the agent should remain paused
 * or unpause upon resuming.
 *
 * @props {Props} props - The properties for the OnResumeToggle component.
 * @prop {string} name - The name of the agent associated with the toggle.
 * @prop {boolean | null} unpauseOnResume- Indicates whats the current agent value for the toggle.
 *
 * @returns {React.FC<Props>} A React element rendering a toggle switch with a tooltip.
 */
export const OnResumeToggle: React.FC<Props> = ({ name, unpauseOnResume }) => {
  const { notifyError } = useAppAlert();
  const { mutate } = usePauseAgent({
    onError: (error) => {
      notifyError({
        title: words("agents.actions.failed"),
        message: error.message,
      });
    },
  });

  const onChange = async () => {
    mutate({
      name,
      action: unpauseOnResume ? "keep_paused_on_resume" : "unpause_on_resume",
    });
  };

  return (
    <Tooltip content={words("agents.actions.onResume")}>
      <Switch
        aria-label={`${name}-on-resume-toggle`}
        isChecked={!!unpauseOnResume}
        onChange={onChange}
      />
    </Tooltip>
  );
};
