import { ReactElement } from "react";
import { StatePresenter } from "@S/ServiceInventory/UI/Presenters";

export class DummyStatePresenter implements StatePresenter {
  getForId(): ReactElement | null {
    return null;
  }
}
