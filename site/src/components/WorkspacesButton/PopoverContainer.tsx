import {
  type KeyboardEvent,
  type PropsWithChildren,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";

import Popover from "@mui/material/Popover";

type Props = PropsWithChildren<{
  /**
   * Does not require any hooks or refs to work. Also does not override any refs
   * or event handlers attached to the button.
   */
  anchorButton: ReactElement;
}>;

function getButton(container: HTMLElement) {
  return (
    container.querySelector("button") ??
    container.querySelector('[aria-role="button"]')
  );
}

export function PopoverContainer({ children, anchorButton }: Props) {
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  // Ref value is for effects and event listeners; state value is for React
  // renders. Have to duplicate state because after the initial render, it's
  // never safe to reference ref contents inside a render path, especially with
  // React 18 concurrency. Duplication is a necessary evil because of MUI's
  // weird, clunky APIs
  const anchorButtonRef = useRef<HTMLButtonElement | null>(null);
  const [loadedButton, setLoadedButton] = useState<HTMLButtonElement>();

  useEffect(() => {
    const buttonContainer = buttonContainerRef.current;
    if (buttonContainer === null) {
      throw new Error("Please attach container ref to button container");
    }

    const initialButton = getButton(buttonContainer);
    if (initialButton === null) {
      throw new Error("Initial ref query failed");
    }
    anchorButtonRef.current = initialButton;

    const onContainerMutation: MutationCallback = () => {
      const newButton = getButton(buttonContainer);
      if (newButton === null) {
        throw new Error("Semantic button removed after DOM update");
      }

      anchorButtonRef.current = newButton;
      setLoadedButton((current) => {
        return current === undefined ? undefined : newButton;
      });
    };

    const observer = new MutationObserver(onContainerMutation);
    observer.observe(buttonContainer, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Not using useInteractive because the container element is just meant to
  // catch events from the inner button, not act as a button itself
  const onInnerButtonInteraction = () => {
    if (anchorButtonRef.current === null) {
      throw new Error("Usable ref value is unavailable");
    }

    setLoadedButton(anchorButtonRef.current);
  };

  const onInnerButtonKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      onInnerButtonInteraction();
    }
  };

  return (
    <>
      <div
        // Disabling semantics for the container does not affect the button
        // placed inside; that button should still be fully accessible
        role="none"
        tabIndex={-1}
        ref={buttonContainerRef}
        onClick={onInnerButtonInteraction}
        onKeyDown={onInnerButtonKeydown}
        style={{ width: "fit-content" }}
      >
        {anchorButton}
      </div>

      <Popover
        open={loadedButton !== undefined}
        anchorEl={loadedButton}
        onClose={() => setLoadedButton(undefined)}
      >
        {children}
      </Popover>
    </>
  );
}
