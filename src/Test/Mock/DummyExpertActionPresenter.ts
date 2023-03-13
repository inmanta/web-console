import { ReactElement } from "react";
import { ActionPresenter } from "@/UI/Presenters";

export class DummyExpertActionPresenter implements ActionPresenter {
  getForId(): ReactElement | null {
    return null;
  }
}
