import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import App from "./App";

describe("App history navigation", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
    });

    window.localStorage.removeItem("hsk1-flashcards-state-v1");
    window.history.replaceState(null, "", "/");
  });

  it("uses the browser back button to leave the active game and return home", async () => {
    render(<App />);

    const toneModeCard = screen.getByRole("heading", { name: "Modo tonos" }).closest("article");

    expect(toneModeCard).not.toBeNull();

    fireEvent.click(
      within(toneModeCard as HTMLElement).getByRole("button", {
        name: "Empezar ronda",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "Ronda activa" }),
    ).toBeInTheDocument();

    window.history.back();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Elegir lista" }),
      ).toBeInTheDocument();
    });
  });
});
