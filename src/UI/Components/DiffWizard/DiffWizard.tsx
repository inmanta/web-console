import React from "react";
import { DiffGroup, DiffGroupInfo } from "./DiffGroup";
import { Intro } from "./Intro";

interface Props {
  groups: DiffGroupInfo[];
  source: string;
  target: string;
}

export const DiffWizard: React.FC<Props> = ({ groups, source, target }) => {
  return (
    <div>
      <Intro source={source} target={target} />
      {groups.map((group) => (
        <DiffGroup key={group.id} {...group} />
      ))}
    </div>
  );
};
