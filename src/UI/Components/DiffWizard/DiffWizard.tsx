import React from "react";
import { Intro } from "./Intro";
import { Item, ItemDiff } from "./ItemDiff";

interface Props {
  items: Item[];
  source: string;
  target: string;
}

export const DiffWizard: React.FC<Props> = ({ items, source, target }) => {
  return (
    <div>
      <Intro source={source} target={target} />
      {items.map((item) => (
        <ItemDiff key={item.id} item={item} />
      ))}
    </div>
  );
};
