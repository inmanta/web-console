interface Leaf<Value> {
  kind: "Leaf";
  value: Value;
  hasRelation?: boolean;
  entity?: string;
  type?: string;
}

interface Branch {
  kind: "Branch";
}

export type TreeNode<Value = unknown> = Branch | Leaf<Value>;
