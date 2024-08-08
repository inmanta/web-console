import { Either } from "@/Core";

type Outcome<Error, Data> =
  | { kind: "Loading" }
  | { kind: "Failed"; error: Error }
  | { kind: "Success"; data: Data };

export type Type<Error, Data> = Outcome<Error, Data>;

export const handle = <Error, Data>(
  outcome: Outcome<Error, Data>,
): Promise<Either.Type<Error, Data>> => {
  switch (outcome.kind) {
    case "Loading":
      return new Promise(() => {
        undefined;
      });

    case "Failed":
      return new Promise((resolve) => {
        resolve(Either.left(outcome.error));
      });

    case "Success":
      return new Promise((resolve) => {
        resolve(Either.right(outcome.data));
      });
  }
};
