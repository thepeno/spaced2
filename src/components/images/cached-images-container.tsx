import { getCachedImage, revokeImage } from '@/lib/images/db';
import { useEffect, useRef } from 'react';

type CachedImagesContainerProps = {
  renderItem: (ref: React.RefObject<HTMLDivElement>) => React.ReactNode;
};

function isHTMLElement(node: Node): node is HTMLElement {
  return node instanceof HTMLElement;
}

function isSrcUrl(src: string): boolean {
  return src.startsWith('http');
}

const DATA_IS_CACHED_SRC_ATTRIBUTE = 'data-is-cached-src';

/**
 * This component is used to indefinitely cache images.
 *
 * All `<img>` children of the container will be fetched from the ImageDatabase.
 * If the image doesn't exist, it will be fetched and added to the database.
 */
export default function CachedImagesContainer({
  renderItem,
}: CachedImagesContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // The mutation observer might not have mounted in time on the initial render,
    // so we need to handle the images manually.
    const imageNodes = ref.current.querySelectorAll('img');
    handleAddedImages(Array.from(imageNodes));

    function handleAddedImages(nodes: HTMLElement[]) {
      const imageNodes = nodes.flatMap((node) =>
        Array.from(node.querySelectorAll('img'))
      );

      imageNodes.forEach(async (image) => {
        const isCached = image.getAttribute(DATA_IS_CACHED_SRC_ATTRIBUTE);
        if (isCached) return;
        if (!isSrcUrl(image.src)) return;

        image.setAttribute(DATA_IS_CACHED_SRC_ATTRIBUTE, image.src);
        image.src = await getCachedImage(image.src);
      });

      return;
    }

    function handleRemovedImages(nodes: HTMLElement[]) {
      const imageNodes = nodes.flatMap((node) =>
        Array.from(node.querySelectorAll('img'))
      );
      const cachedImageNodes = imageNodes.filter((image) =>
        image.getAttribute(DATA_IS_CACHED_SRC_ATTRIBUTE)
      );

      cachedImageNodes.forEach((image) => {
        const originalSrc = image.getAttribute(DATA_IS_CACHED_SRC_ATTRIBUTE);
        if (!originalSrc) return;

        image.removeAttribute(DATA_IS_CACHED_SRC_ATTRIBUTE);
        revokeImage(originalSrc);
      });
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== 'childList') return;

        if (mutation.addedNodes.length > 0) {
          handleAddedImages(
            Array.from(mutation.addedNodes).filter(isHTMLElement)
          );
        }

        if (mutation.removedNodes.length > 0) {
          handleRemovedImages(
            Array.from(mutation.removedNodes).filter(isHTMLElement)
          );
        }
      });
    });

    // subtree is necessary to observe changes as we wrap around the container,
    // which is not re-rendered when the reviewCard changes
    observer.observe(ref.current, {
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return <>{renderItem(ref)}</>;
}
