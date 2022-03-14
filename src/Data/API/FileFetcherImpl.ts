import { FileFetcher, Either, Maybe, ApiHelper } from "@/Core";

interface RawResponse {
  content?: string;
  message?: string;
}

export class FileFetcherImpl implements FileFetcher {
  private environment: Maybe.Type<string> = Maybe.none();

  constructor(private readonly apiHelper: ApiHelper, environment?: string) {
    if (typeof environment === "undefined") return;
    this.environment = Maybe.some(environment);
  }

  private getEnvironment(): string {
    if (Maybe.isSome(this.environment)) return this.environment.value;
    throw new Error("Environment not set");
  }

  setEnvironment(environment: string): void {
    this.environment = Maybe.some(environment);
  }

  private sanitizeFileId(fileId): string {
    return window.encodeURIComponent(fileId);
  }

  private getUrl(fileId: string): string {
    return `/api/v1/file/${this.sanitizeFileId(fileId)}`;
  }

  async get(fileId: string): Promise<Either.Type<string, string>> {
    return this.unpack(
      await this.apiHelper.get<RawResponse>(
        this.getUrl(fileId),
        this.getEnvironment()
      )
    );
  }

  private unpack(
    either: Either.Type<string, RawResponse>
  ): Either.Type<string, string> {
    if (Either.isRight(either)) {
      const response = either.value;
      if (typeof response.message !== "undefined") {
        return Either.left(response.message);
      }
      if (typeof response.content !== "undefined") {
        return Either.right(this.decodeBase64String(response.content));
      }

      return Either.left("No data");
    }

    return either;
  }

  private decodeBase64String(data: string): string {
    try {
      return window.atob(data);
    } catch (e) {
      return data;
    }
  }
}
