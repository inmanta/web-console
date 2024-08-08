export type ClassifiedAttribute =
  | Undefined
  | SingleLine
  | MultiLine
  | Password
  | File
  | Json
  | Xml
  | Python;

interface Base<Kind> {
  kind: Kind;
  key: string;
  value: string;
}

type SingleLine = Base<"SingleLine">;
type MultiLine = Base<"MultiLine">;
type Json = Base<"Json">;
type Xml = Base<"Xml">;
type Password = Base<"Password">;
type File = Base<"File">;
type Python = Base<"Python">;

interface Undefined {
  kind: "Undefined";
  key: string;
}
