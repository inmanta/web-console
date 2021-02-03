import { ReactElement } from "react";
import { StatePresenter } from "@/UI/ServiceInventory/Presenters";

export class DummyStatePresenter implements StatePresenter {
  getForId(): ReactElement | null {
    return null;
  }
}
