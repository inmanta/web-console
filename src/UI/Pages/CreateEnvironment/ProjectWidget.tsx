import { ProjectModel } from "@/Core";
import { Select, SelectOption } from "@patternfly/react-core";
import React, { useState } from "react";

interface Props {
  projects: ProjectModel[];
}

export const ProjectWidget: React.FC<Props> = ({ projects }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const onSelect = (event, selection, isPlaceHolder) => {
    console.log(selection, isPlaceHolder);
    setSelected(selection);
    setIsOpen(false);
  };
  const onCreate = (newValue: string) => {
    console.log(newValue);
  };

  return (
    <>
      <Select
        variant="typeahead"
        onToggle={() => {
          setIsOpen(!isOpen);
        }}
        isOpen={isOpen}
        onSelect={onSelect}
        selections={selected}
        isCreatable
        onCreateOption={onCreate}
      >
        {projects.map((project) => (
          <SelectOption key={project.id} value={project.id}>
            {project.name}
          </SelectOption>
        ))}
      </Select>
    </>
  );
};
