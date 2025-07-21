import { Excalidraw as ExcalidrawBase } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";
import type {
  AppState,
  ExcalidrawImperativeAPI,
  ExcalidrawProps
} from "@excalidraw/excalidraw/types";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * ✅ Type-safe override for Excalidraw component to support ref
 */
const Excalidraw = ExcalidrawBase as unknown as React.FC<
  ExcalidrawProps & { ref?: React.Ref<ExcalidrawImperativeAPI> }
>;

export default function Whiteboard() {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("whiteboard-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
  }, []);

  const handleChange = useCallback(
    (
      _elements: readonly ExcalidrawElement[],
      appState: AppState,
    ) => {
      if (appState.theme === "dark" || appState.theme === "light") {
        localStorage.setItem("whiteboard-theme", appState.theme);
        setTheme(appState.theme);
      }
    },
    []
  );

  return (
    <div style={{ height: "100vh" }}>
      <Excalidraw
        ref={excalidrawRef}
        onChange={handleChange}
        initialData={{
          appState: { theme },
        }}
      />
    </div>
  );
}
