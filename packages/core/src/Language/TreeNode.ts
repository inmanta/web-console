interface Leaf<Value> {
  kind: "Leaf";
  value: Value;
  hasRelation?: boolean;
}

interface Branch {
  kind: "Branch";
}

export type TreeNode<Value = unknown> = Branch | Leaf<Value>;
