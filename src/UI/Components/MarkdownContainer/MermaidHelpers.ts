// Mermaid is a js library and doesn't have official Typescript support.
/* eslint-disable @typescript-eslint/no-explicit-any */
import Mermaid from "mermaid";
import { words } from "@/UI/words";

/**
 * Serializes the first `<svg>` found in `block` and triggers a browser download
 * of the result as `mermaid-diagram.svg`. No-ops when no SVG is present.
 *
 * @param block - The rendered mermaid `<pre>` element containing the SVG.
 */
export function downloadAsSvg(block: HTMLElement): void {
  const svg = block.querySelector("svg");

  if (!svg) {
    return;
  }

  const serialized = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([serialized], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "mermaid-diagram.svg";
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Renders the first `<svg>` found in `block` onto a 2× off-screen canvas and
 * triggers a browser download of the result as `mermaid-diagram.png`.
 * The 2× scale produces a high-DPI image suitable for HiDPI/Retina displays.
 * Falls back to 800×600 when the SVG reports zero dimensions (e.g. in jsdom).
 * No-ops when no SVG or 2D canvas context is available.
 *
 * @param block - The rendered mermaid `<pre>` element containing the SVG.
 */
export function downloadAsPng(block: HTMLElement): void {
  const svg = block.querySelector("svg");

  if (!svg) {
    return;
  }

  const svgWidth = svg.viewBox?.baseVal?.width || svg.getBoundingClientRect().width || 800;
  const svgHeight = svg.viewBox?.baseVal?.height || svg.getBoundingClientRect().height || 600;
  const scale = 2;

  const canvas = document.createElement("canvas");
  canvas.width = svgWidth * scale;
  canvas.height = svgHeight * scale;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  ctx.scale(scale, scale);

  const serialized = new XMLSerializer().serializeToString(svg);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
  const img = new Image();

  img.onload = () => {
    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = "mermaid-diagram.png";
    a.click();
  };

  img.src = url;
}

/**
 * Injects a `.mermaid-toolbar` overlay containing "↓ SVG" and "↓ PNG" download
 * buttons into `block`. Each button stops click propagation so it does not
 * accidentally trigger the diagram's zoom handler. Guards against double-injection:
 * does nothing when a toolbar is already present.
 *
 * @param block - The rendered mermaid `<pre>` element to attach the toolbar to.
 */
export function addDownloadToolbar(block: HTMLElement): void {
  if (block.querySelector(".mermaid-toolbar")) {
    return;
  }

  const toolbar = document.createElement("div");
  toolbar.className = "mermaid-toolbar";

  const svgBtn = document.createElement("button");
  svgBtn.className = "mermaid-download-btn";
  svgBtn.title = words("markdownContainer.download.svg.title");
  svgBtn.textContent = words("markdownContainer.download.svg");
  svgBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    downloadAsSvg(block);
  });

  const pngBtn = document.createElement("button");
  pngBtn.className = "mermaid-download-btn";
  pngBtn.title = words("markdownContainer.download.png.title");
  pngBtn.textContent = words("markdownContainer.download.png");
  pngBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    downloadAsPng(block);
  });

  toolbar.appendChild(svgBtn);
  toolbar.appendChild(pngBtn);
  block.appendChild(toolbar);
}

/**
 * Replaces `block`'s content with a styled error message and strips the
 * `mermaid-diagram` class and `data-zoomable` attribute so the block is no
 * longer treated as a zoomable/downloadable diagram.
 *
 * @param block - The mermaid `<pre>` element that failed to render.
 * @param error - The error thrown by Mermaid's `run()` or `init()` API.
 */
export function showMermaidError(block: HTMLElement, error: unknown): void {
  block.classList.add("mermaid-error");
  block.classList.remove("mermaid-diagram");
  block.removeAttribute("data-zoomable");
  block.innerHTML = "";

  const errorDiv = document.createElement("div");
  errorDiv.className = "mermaid-error-message";
  errorDiv.style.cssText =
    "padding: 1rem; margin: 1rem 0; background-color: var(--pf-t--global--color--nonstatus--red--default, #c9190b); color: var(--pf-t--global--text--color--status--danger--default, #fff); border-radius: var(--pf-t--global--border--radius--small, 4px); font-family: var(--pf-t--global--font--family--mono, monospace); font-size: 0.875rem;";

  const errorMessage =
    (error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error)) || words("error.unknown");

  errorDiv.innerHTML = `
    <strong>${words("markdownContainer.error.mermaid.title")}</strong><br/>
    <code>${errorMessage}</code>
  `;

  block.appendChild(errorDiv);
}

/**
 * Initializes Mermaid and processes every `pre.mermaid` block in `container`.
 * Successfully rendered blocks receive the `mermaid-diagram` class,
 * `data-zoomable` attribute, the provided click handler, and a download toolbar.
 * Failed blocks fall back to `showMermaidError`.
 *
 * @param container - The markdown body element that holds the mermaid blocks.
 * @param handleImageClick - Click handler to attach to each successfully rendered diagram for zoom behaviour.
 */
export function renderMermaidBlocks(
  container: HTMLElement,
  handleImageClick: (event: Event) => void
): () => void {
  const mermaidBlocks = container.querySelectorAll<HTMLElement>("pre.mermaid");

  if (mermaidBlocks.length === 0) {
    return () => {};
  }

  const isDarkTheme = document.documentElement.classList.contains("pf-v6-theme-dark");

  (Mermaid as any).initialize({
    startOnLoad: false,
    securityLevel: "loose",
    // Switch Mermaid theme based on the current PatternFly theme.
    // This keeps diagrams readable in both light and dark modes.
    theme: isDarkTheme ? "dark" : "default",
  });

  const observers: MutationObserver[] = [];
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  mermaidBlocks.forEach((block) => {
    // Only run Mermaid if the block contains actual diagram text, not an SVG
    if (block.querySelector("svg")) {
      return;
    }

    // Clear any previous error state
    block.classList.remove("mermaid-error");
    const existingError = block.querySelector(".mermaid-error-message");
    if (existingError) {
      existingError.remove();
    }

    // Remove data-processed to allow re-rendering during live editing
    block.removeAttribute("data-processed");

    // Idempotent activation: adds the diagram class, zoom attribute, click
    // handler, and download toolbar. Safe to call from both the observer and
    // the fallback timeout — whichever fires first wins; the second call is a
    // no-op because of the mermaid-diagram class check.
    const activateBlock = () => {
      if (block.classList.contains("mermaid-diagram")) return;
      if (block.classList.contains("mermaid-error")) return;
      block.classList.add("mermaid-diagram");
      block.setAttribute("data-zoomable", "true");
      block.addEventListener("click", handleImageClick);
      addDownloadToolbar(block);
    };

    // Observer: fires when Mermaid injects the SVG — handles blocks that are
    // off-screen or take longer than the fallback timeout to render.
    const blockObserver = new MutationObserver((_mutations, obs) => {
      if (block.classList.contains("mermaid-error")) {
        obs.disconnect();
        return;
      }
      if (block.querySelector("svg")) {
        obs.disconnect();
        activateBlock();
      }
    });

    observers.push(blockObserver);
    blockObserver.observe(block, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    try {
      // In Mermaid 11+, run() is the preferred API to process specific nodes.
      if (typeof (Mermaid as any).run === "function") {
        const runPromise = (Mermaid as any).run({ nodes: [block] as any });
        // Handle async errors from run()
        if (runPromise && typeof runPromise.catch === "function") {
          runPromise.catch((error: any) => {
            showMermaidError(block, error);
          });
        }
      } else if (typeof (Mermaid as any).init === "function") {
        // Fallback for older versions
        try {
          (Mermaid as any).init(undefined, [block] as any);
        } catch (error) {
          showMermaidError(block, error);
        }
      }
    } catch (error) {
      showMermaidError(block, error);
    }

    // Fallback timeout: activates the block after a short delay for cases
    // where Mermaid renders synchronously or the observer doesn't fire.
    const t = setTimeout(() => {
      blockObserver.disconnect();
      activateBlock();
    }, 100);

    timeouts.push(t);
  });

  return () => {
    observers.forEach((obs) => obs.disconnect());
    timeouts.forEach(clearTimeout);
  };
}
