import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RETRIES = 3;

type ImageTrackerEntry = {
  image: HTMLImageElement;
  status: "loading" | "error" | "success";
  retries: number;
};

// This is intended to be shared mutable state accessible by all components
// using the general function or the hook
const imageTracker = new Map<string, ImageTrackerEntry>();

export function preloadImages(imageUrls?: readonly string[]): () => void {
  if (imageUrls === undefined) {
    // Just a noop
    return () => {};
  }

  const retryTimeoutIds: number[] = [];

  for (const imgUrl of imageUrls) {
    const prevEntry = imageTracker.get(imgUrl);

    if (prevEntry === undefined) {
      const dummyImage = new Image();
      dummyImage.src = imgUrl;

      const entry: ImageTrackerEntry = {
        image: dummyImage,
        status: "loading",
        retries: 0,
      };

      dummyImage.onload = () => {
        entry.status = "success";
      };

      dummyImage.onerror = () => {
        if (imgUrl !== "") {
          entry.status = "error";
        }
      };

      imageTracker.set(imgUrl, entry);
      continue;
    }

    const skipRetry =
      prevEntry.status === "loading" ||
      prevEntry.status === "success" ||
      prevEntry.retries === MAX_RETRIES;

    if (skipRetry) {
      continue;
    }

    prevEntry.image.src = "";
    const retryId = window.setTimeout(() => {
      prevEntry.image.src = imgUrl;
      prevEntry.retries++;
    }, 0);

    retryTimeoutIds.push(retryId);
  }

  return () => {
    for (const id of retryTimeoutIds) {
      window.clearTimeout(id);
    }
  };
}

// Shared mutable throttle state for all components

/**
 * Exposes a throttled version of preloadImages.
 *
 * The throttling state is always associated with the component instance,
 * meaning that one component being throttled won't prevent other components
 * from making requests.
 */
export function useThrottledPreloadImages() {
  const throttledRef = useRef(false);

  return useCallback((imgUrls?: readonly string[]) => {
    if (throttledRef.current || imgUrls === undefined) {
      // Noop
      return () => {};
    }

    throttledRef.current = true;
    const cleanupPreload = preloadImages(imgUrls);
    const timeoutId = window.setTimeout(() => {
      throttledRef.current = false;
    }, 500);

    return () => {
      cleanupPreload();
      window.clearTimeout(timeoutId);
      throttledRef.current = false;
    };
  }, []);
}

export function useImagePreloading(imgUrls?: readonly string[]) {
  // Doing weird, hacky nonsense to guarantee useEffect doesn't run too often,
  // even if consuming component doesn't stabilize value of imgUrls
  const [cachedUrls, setCachedUrls] = useState(imgUrls);

  // Very uncommon pattern, but it's based on something from the official React
  // docs, and the comparison should have no perceivable effect on performance
  if (cachedUrls !== imgUrls) {
    const changedByValue =
      imgUrls?.length !== cachedUrls?.length ||
      !cachedUrls?.every((url, index) => url === imgUrls?.[index]);

    if (changedByValue) {
      setCachedUrls(imgUrls);
    }
  }

  useEffect(() => {
    return preloadImages(cachedUrls);
  }, [cachedUrls]);
}
