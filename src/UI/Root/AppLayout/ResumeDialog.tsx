import { ConfirmationDialog } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Button } from "@patternfly/react-core";
import { PlayIcon } from "@patternfly/react-icons";
import React, { useContext } from "react";
import styled from "styled-components";

interface Props {
  environment: string;
}

export const ResumeDialog: React.FC<Props> = ({ environment }) => {
  const { commandResolver } = useContext(DependencyContext);

  const resumeEnvironmentTrigger =
    commandResolver.getTrigger<"ResumeEnvironment">({
      kind: "ResumeEnvironment",
    });
  return (
    <ConfirmationDialog
      modalButton={
        <GreenButton icon={<PlayIcon />}>
          {words("environment.resume.button")}
        </GreenButton>
      }
      onConfirm={resumeEnvironmentTrigger}
      modalContent={words("environment.resume.details")(environment)}
      title={words("environment.resume.title")}
      confirmText={words("yes")}
      cancelText={words("no")}
    />
  );
};

const GreenButton = styled(Button)`
  && {
    background-color: var(--pf-global--success-color--100);
  }
`;
