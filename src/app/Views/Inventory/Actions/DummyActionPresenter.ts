import { ReactElement } from "react";
import { ActionPresenter } from "./ActionPresenter";

export class DummyActionPresenter implements ActionPresenter {
  getForId(id: string): ReactElement | null {
    id;
    return null;
  }
}
