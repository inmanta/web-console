import React, { useContext } from "react";
import { Switch, Tooltip } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { GetAgentsContext } from "@S/Agents/UI/GetAgentsContext";

interface Props {
  name: string;
  unpauseOnResume?: boolean | null;
}

export const OnResumeToggle: React.FC<Props> = ({ name, unpauseOnResume }) => {
  const { commandResolver } = useContext(DependencyContext);
  const agentActionTrigger = commandResolver.useGetTrigger<"ControlAgent">({
    kind: "ControlAgent",
    name,
    action: unpauseOnResume ? "keep_paused_on_resume" : "unpause_on_resume",
  });
  const { filter, sort, pageSize, setErrorMessage } =
    useContext(GetAgentsContext);
  const onChange = async () => {
    const result = await agentActionTrigger({
      kind: "GetAgents",
      filter,
      sort,
      pageSize,
    });
    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    }
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
