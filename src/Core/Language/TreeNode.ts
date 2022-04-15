interface Leaf<Value> {
  kind: "Leaf";
  value: Value;
  hasOnClick?: boolean;
  entity?: string;
}

interface Branch {
  kind: "Branch";
}

export type TreeNode<Value = unknown> = Branch | Leaf<Value>;
