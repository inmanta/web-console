import React, { useContext } from "react";
import { Switch, Tooltip } from "@patternfly/react-core";
import { usePauseAgent } from "@/Data/Managers/V2/Miscellaneous";
import { words } from "@/UI/words";
import { GetAgentsContext } from "@S/Agents/UI/GetAgentsContext";

interface Props {
  name: string;
  unpauseOnResume?: boolean | null;
}

export const OnResumeToggle: React.FC<Props> = ({ name, unpauseOnResume }) => {
  const { setErrorMessage } = useContext(GetAgentsContext);
  const { mutate } = usePauseAgent({
    onError: (error) => {
      setErrorMessage(error.message);
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
