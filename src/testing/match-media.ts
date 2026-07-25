import { vi } from 'vitest';

type ChangeHandler = (e: { matches: boolean }) => void;

export function installMatchMedia(initialMatches: boolean = false) {
  let capturedHandler: ChangeHandler | undefined;

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: initialMatches,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: (_type: string, handler: ChangeHandler) => {
      capturedHandler = handler;
    },
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;

  return {
    fireChange(matches: boolean) {
      capturedHandler?.({ matches });
    },
  };
}
