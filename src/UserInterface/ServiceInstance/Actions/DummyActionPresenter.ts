import { ReactElement } from "react";
import { ActionPresenter } from "./ActionPresenter";

export class DummyActionPresenter implements ActionPresenter {
  getForId(): ReactElement | null {
    return null;
  }
}
