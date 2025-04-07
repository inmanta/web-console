import React, { useEffect, useRef } from 'react';
import markdownit from 'markdown-it';
import { full } from 'markdown-it-emoji';
import mermaidPlugin from './MermaidPlugin';
import './styles.css';

/**
 * Props for the MarkdownContainer component.
 */
interface Props {
  text: string; // The Markdown content to be rendered.
  web_title: string; // The title of the web page to generate a unique Id for the mermaid elements.
}

/**
 * Component that renders a container for displaying Markdown content.
 * It uses the markdown-it library to parse and render the Markdown content.
 * It also supports rendering Mermaid diagrams.
 *
 * @param props - The properties of the component.
 *  @prop text - The Markdown content to be rendered.
 *  @prop web_title - The title of the tab. This is used to generate the unique Id's for the mermaid elements.
 *
 * @returns A React component that renders a container for displaying Markdown content.
 */
export const MarkdownContainer = ({ text, web_title }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const md = new markdownit({
    html: false,
    breaks: true,
    linkify: true,
    typographer: true,
  });

  md.use(full);
  md.use((md) => mermaidPlugin(md, web_title, {}));

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleImageClick = (event: Event) => {
      const img = event.target as HTMLImageElement;

      if (!img.matches('.mermaid-diagram[data-zoomable="true"]')) return;

      event.stopPropagation();

      const isZoomed = img.classList.contains('zoomed');

      // Remove zoomed class from all other images
      container.querySelectorAll('.mermaid-diagram.zoomed').forEach((el) => {
        if (el !== img) {
          el.classList.remove('zoomed');
        }
      });

      if (isZoomed) {
        img.classList.remove('zoomed');
        document.body.style.overflow = '';
      } else {
        img.classList.add('zoomed');
        document.body.style.overflow = 'hidden';
      }
    };

    const handleDocumentClick = (event: Event) => {
      if (!container.contains(event.target as Node)) {
        container.querySelectorAll('.mermaid-diagram.zoomed').forEach((img) => {
          img.classList.remove('zoomed');
        });
        document.body.style.overflow = '';
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        container.querySelectorAll('.mermaid-diagram.zoomed').forEach((img) => {
          img.classList.remove('zoomed');
        });
        document.body.style.overflow = '';
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLImageElement &&
            node.matches('.mermaid-diagram[data-zoomable="true"]')
          ) {
            node.addEventListener('click', handleImageClick);
          }
        });
      });
    });

    // Start observing the container for added nodes
    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // Add initial event listeners
    container
      .querySelectorAll('.mermaid-diagram[data-zoomable="true"]')
      .forEach((img) => {
        img.addEventListener('click', handleImageClick);
      });

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
      container
        .querySelectorAll('.mermaid-diagram[data-zoomable="true"]')
        .forEach((img) => {
          img.removeEventListener('click', handleImageClick);
        });
      document.body.style.overflow = '';
    };
  }, [text]);

  const result = md.render(text);

  return (
    <div
      ref={containerRef}
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: result }}
    />
  );
};
