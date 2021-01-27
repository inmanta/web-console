interface Leaf<Value> {
  kind: "Leaf";
  value: Value;
}

interface Branch {
  kind: "Branch";
}

export type TreeNode<Value = unknown> = Branch | Leaf<Value>;
