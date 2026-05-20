import { useState, useEffect } from "react";

export function usePageOffset() {
  const getOffset = () =>
    typeof window !== "undefined" && window.innerWidth < 768
      ? "0px"
      : "250px";

  const [offset, setOffset] = useState(getOffset());

  useEffect(() => {
    const update = () => setOffset(getOffset());

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return offset;
}