import React from "react";
import { diffChars } from "diff";

const green = "rgb(172, 242, 189)";
const greenFaded = "rgb(230, 255, 237)";
const red = "rgb(253, 184, 192)";
const redFaded = "rgb(255, 238, 240)";

export const DiffExample: React.FC = () => {
  const source = "beep boop";
  const target = "beep boob bla";

  const diff = diffChars(source, target);

  const elements = diff.map((part, index) => {
    const color = part.added ? "green" : part.removed ? "red" : "grey";
    return (
      <span key={index} style={{ color }}>
        {part.value}
      </span>
    );
  });

  return <>{elements}</>;
};

export const DiffExampleSide: React.FC = () => {
  const source = "beep boop";
  const target = "beep boob bla";

  const diff = diffChars(source, target);

  const elementsDeleted = diff.map((part, index) => {
    const color = part.removed ? red : redFaded;
    return part.added ? (
      <span key={index} />
    ) : (
      <span key={index} style={{ backgroundColor: color }}>
        {part.value}
      </span>
    );
  });

  const elementsAdded = diff.map((part, index) => {
    const color = part.added ? green : greenFaded;
    return part.removed ? (
      <span key={index} />
    ) : (
      <span key={index} style={{ backgroundColor: color }}>
        {part.value}
      </span>
    );
  });

  return (
    <>
      <p>{elementsDeleted}</p>
      <p>{elementsAdded}</p>
    </>
  );
};
