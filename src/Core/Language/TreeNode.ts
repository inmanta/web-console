interface Leaf<Value> {
  kind: "Leaf";
  value: Value;
  hasOnClick?: boolean;
}

interface Branch {
  kind: "Branch";
}

export type TreeNode<Value = unknown> = Branch | Leaf<Value>;
