import { ui } from "@inmanta/rappid";
import { words } from "@/UI/words";
import exitFullscreen from "../icons/exit-fullscreen.svg";
import fitToScreen from "../icons/fit-to-screen.svg";
import requestFullscreen from "../icons/request-fullscreen.svg";

/**
 * Interface for a button with an icon and a tooltip.
 *
 * This interface extends the ui.widgets.button interface and adds methods for setting the icon and the tooltip of the button.
 */
interface IconButton extends ui.widgets.button {
  setIcon(icon: string): void;
  setTooltip(tooltip: string): void;
}

/**
 * IconButton
 *
 * It extends the ui.widgets.button class and represents a button with an icon.
 * It provides methods for setting the icon and the tooltip of the button.
 *
 */
const IconButton = ui.widgets.button.extend({
  render: function () {
    const size = this.options.size || 20;
    const imageEl = document.createElement("img");

    imageEl.style.width = `${size}px`;
    imageEl.style.height = `${size}px`;
    this.el.appendChild(imageEl);
    this.setIcon(this.options.icon);
    this.setTooltip(this.options.tooltip);

    return this;
  },

  /**
   * Sets the icon of the element.
   *
   * This method is responsible for setting the source of the image element within the current element to the provided icon.
   *
   * @param {string} icon - The source of the icon to set. Defaults to an empty string, which will clear the current icon.
   */
  setIcon: function (icon = "") {
    this.el.querySelector("img").src = icon;
  },

  /**
   * Sets the tooltip of the element.
   *
   * This method is responsible for setting the tooltip of the current element to the provided tooltip.
   * It also sets the position of the tooltip.
   *
   * @param {string} tooltip - The text of the tooltip to set. Defaults to an empty string, which will clear the current tooltip.
   * @param {string} direction - The position of the tooltip. Defaults to "right".
   */
  setTooltip: function (tooltip = "", direction = "right") {
    this.el.dataset.tooltip = tooltip;
    this.el.dataset.tooltipPosition = direction;
  },
});

/**
 * ZoomHandlerService class
 *
 * This class is responsible for managing the paning of the canvas.
 * It provides methods for zoom to fit, zooming in/out in the canvas and fullscreen toggle.
 *
 * @class
 * @prop {ui.Toolbar} toolbar - The toolbar object that contains the paning controls.
 * @method constructor - Constructs a new instance of the ZoomHandlerService class.
 * @param {HTMLElement} element - The HTML element that will contain the zoomHandler.
 * @param {ui.PaperScroller} scroller - The scroller object that allows and zooming in the canvas.
 */
export class ZoomHandlerService {
  toolbar: ui.Toolbar;

  constructor(
    private element: HTMLElement,
    private scroller: ui.PaperScroller,
  ) {
    this.toolbar = new ui.Toolbar({
      autoToggle: true,
      references: {
        paperScroller: scroller,
      },
      tools: [
        {
          type: "icon-button",
          name: "fullscreen",
          tooltip: words("instanceComposer.zoomHandler.fullscreen.toggle"),
          attrs: {
            button: {
              "data-testid": "fullscreen",
              class: "pf-v6-c-button pf-m-control",
            },
          },
        },
        {
          type: "icon-button",
          name: "fit-to-screen",
          tooltip: words("instanceComposer.zoomHandler.zoomToFit"),
          attrs: {
            button: {
              "data-testid": "fit-to-screen",
              class: "pf-v6-c-button pf-m-control",
            },
          },
        },
        {
          id: "zoomSlider",
          type: "zoom-slider",
          min: 0.2 * 100,
          max: 5 * 100,
          attrs: {
            input: {
              "data-tooltip": words("instanceComposer.zoomHandler.zoom"),
              "data-tooltip-position": "bottom",
              "data-testid": "slider-input",
            },
            output: {
              "data-testid": "slider-output",
            },
          },
        },
      ],
      widgetNamespace: {
        ...ui.widgets,
        iconButton: IconButton,
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      } as any, //ui.widgets aren't aligned with widgetNamespace typing, that's a snippet from the JointJS typeScript demo
    });

    this.toolbar.render();
    this.toolbar.el.dataset.testid = "zoomHandler";
    this.updateFullscreenStyling(); //set the icon of the button as adding icons through object properties wasn't loading the icons properly
    this.element.appendChild(this.toolbar.el);

    new ui.Tooltip({
      rootTarget: ".zoom-handler",
      target: "[data-tooltip]",
      padding: 16,
    });

    const fullscreenButton = this.toolbar.getWidgetByName(
      "fit-to-screen",
    ) as IconButton;

    fullscreenButton.setIcon(`${fitToScreen}`); //set the icon of the button as adding icons through object properties wasn't loading the icons properly

    this.toolbar.on("fit-to-screen:pointerclick", () => this.fitToScreen());
    this.toolbar.on("fullscreen:pointerclick", () => this.toggleFullscreen());

    this.updateFullscreenStyling = this.updateFullscreenStyling.bind(this);
    this.updateSliderOnInput = this.updateSliderOnInput.bind(this);

    document.addEventListener("fullscreenchange", this.updateFullscreenStyling);

    const zoomSlider = document.getElementById("zoomSlider");

    if (zoomSlider) {
      zoomSlider.addEventListener("input", this.updateSliderOnInput);
    }
  }

  /**
   * Fits all of the canvas's elements to the screen.
   *
   * This method is responsible for adjusting the zoom level of the canvas so that it shows all it's elements on the screen.
   * It uses the zoomToFit method of the scroller object, which is a joint.ui.PaperScroller.
   */
  fitToScreen() {
    this.scroller.zoomToFit({ useModelGeometry: true, padding: 20 });

    const sliderWrapper = document.getElementById("zoomSlider");

    if (!sliderWrapper) {
      return;
    }

    const slider = sliderWrapper.children[0];

    if (!slider) {
      return;
    }

    this.updateSliderProgressBar(slider as HTMLInputElement);
  }

  updateSliderOnInput(event) {
    if (!event.target) {
      return;
    }
    const slider: HTMLInputElement = event.target;

    this.updateSliderProgressBar(slider);
  }

  /**
   * Updates the progress bar of the zoom slider.
   *
   * This method is responsible for updating the background of the zoom slider to reflect the current zoom level as currently chromium based browsers don't support styling of the progressbar.
   * The zoom level is calculated as a percentage of the slider's current value relative to its minimum and maximum values.
   *
   * @param {HTMLInputElement} slider - The zoom slider, which is an HTML input element.
   */
  updateSliderProgressBar(slider: HTMLInputElement) {
    const value =
      ((Number(slider.value) - Number(slider.min)) /
        (Number(slider.max) - Number(slider.min))) *
      100;

    slider.style.setProperty(
      "--slider-background",
      `linear-gradient(to right, 
        var(--pf-t--global--border--color--brand--default) 0%, 
        var(--pf-t--global--border--color--brand--default), ${value.toFixed(0)}%, 
        var(--pf-t--global--border--color--nonstatus--gray--default) ${value.toFixed(0)}%, 
        var(--pf-t--global--border--color--nonstatus--gray--default) 100%)`,
    );
  }

  /**
   * Toggles the fullscreen mode of the document.
   *
   * This method is responsible for switching the document between fullscreen mode and normal mode.
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  /**
   * Changes the display style of an HTML element.
   *
   * This function is responsible for changing the display style of an HTML element.
   * It uses the document.querySelector method to find the element and changes its display style.
   *
   * @param {string} selector - The CSS selector of the element to change.
   * @param {string} display - The new display style for the element.
   */
  changeDisplay(selector: string, display: string) {
    const element: HTMLElement | null = document.querySelector(selector);

    if (element) {
      element.style.display = display;
    }
  }

  /**
   * Updates the state of the toolbar buttons.
   *
   * This method is responsible for toggling visual state of the button responsible for toggling full screen mode,
   * as well as the display of the page components when full screen mode is toggled.
   *
   * @method
   */
  updateFullscreenStyling() {
    const fullscreenButton = this.toolbar.getWidgetByName(
      "fullscreen",
    ) as IconButton;

    const canvas = document.querySelector("#canvas-wrapper");
    const banners = document.querySelectorAll(".pf-v6-c-banner"); // TODO: Needs to be updated to avoid targetting a class

    if (canvas) {
      canvas.classList.toggle("fullscreen", !!document.fullscreenElement);
    }

    if (banners) {
      banners.forEach(
        (el) =>
          ((el as HTMLElement).style.display = document.fullscreenElement
            ? "none"
            : "block"),
      );
    }

    if (document.fullscreenElement) {
      this.changeDisplay("#page-sidebar", "none");
      this.changeDisplay("#page-header", "none");

      fullscreenButton.setIcon(`${exitFullscreen}`);
      fullscreenButton.setTooltip(
        words("instanceComposer.zoomHandler.fullscreen.exit"),
      );
    } else {
      this.changeDisplay("#page-sidebar", "flex");
      this.changeDisplay("#page-header", "grid");

      fullscreenButton.setIcon(`${requestFullscreen}`);
      fullscreenButton.setTooltip(
        words("instanceComposer.zoomHandler.fullscreen.toggle"),
      );
    }
  }

  remove() {
    this.toolbar.remove();

    document.removeEventListener(
      "fullscreenchange",
      this.updateFullscreenStyling,
    );

    const zoomSlider = document.getElementById("zoomSlider");

    if (zoomSlider) {
      zoomSlider.removeEventListener("input", this.updateSliderOnInput);
    }
  }
}
