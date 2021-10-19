import { ApiHelper } from "@/Core";
import { PosterImpl } from "@/Data/API";

export class CallbackPoster extends PosterImpl<"CreateCallback"> {
  constructor(apiHelper: ApiHelper, environment: string) {
    super(apiHelper, environment, () => "/lsm/v1/callbacks");
  }
}
