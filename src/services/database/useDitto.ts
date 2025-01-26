import { getDitto } from "./ditto";
import { useEffect, useState } from "react";

export function useDitto() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset error state on mount
    setError(null);
  }, []);

  const safeDitto = () => {
    try {
      return getDitto();
    } catch (e) {
      setError(
        e instanceof Error ? e : new Error("Failed to get Ditto instance")
      );
      throw e;
    }
  };

  return {
    ditto: safeDitto,
    error,
  };
}
