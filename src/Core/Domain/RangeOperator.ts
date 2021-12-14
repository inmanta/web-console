export enum Operator {
  From = "from",
  To = "to",
}

export const isValidOperator = (value: unknown): value is Operator =>
  typeof value === "string" && ["from", "to"].includes(value);

export const serializeOperator = (operator: Operator): string => {
  switch (operator) {
    case Operator.From:
      return "ge";
    case Operator.To:
      return "le";
  }
};
