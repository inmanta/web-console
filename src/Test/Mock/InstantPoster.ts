import { Either, Poster, Command, RemoteData } from "@/Core";

export class InstantPoster<K extends Command.Kind> implements Poster<K> {
  constructor(
    private outcome: RemoteData.Type<Command.Error<K>, Command.ApiData<K>>
  ) {}

  post(): Promise<Either.Type<Command.Error<K>, Command.ApiData<K>>> {
    const { outcome } = this;

    switch (outcome.kind) {
      case "NotAsked":
      case "Loading":
        return new Promise(() => {
          undefined;
        });

      case "Failed":
        return new Promise((resolve) => {
          resolve(Either.left(outcome.value));
        });

      case "Success":
        return new Promise((resolve) => {
          resolve(Either.right(outcome.value));
        });
    }
  }
}
