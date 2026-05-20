import { usePageOffset } from "../hook/usePageOffset";

export function PageContent({ children, className = "", style = {} }) {
  const offset = usePageOffset();
  const isMobile = offset === "0px";

  return (
    <div
      className={`flex-grow-1 ${className}`}
      style={{
        marginLeft: offset,
        paddingTop: isMobile ? "62px" : "0px",
        minWidth: 0,
        transition: "margin-left 0.3s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}