import { Art } from "@/components/kozmoz/art";

/**
 * The page as a sheet of paper floating over frosted white (Art): every page
 * puts its header, main and footer inside. kozmoz.css sets its margin and
 * corners, the soft edge it dissolves at, and the lift it rises in with ("the
 * panel"). The paper is masked to fade at its edges, which would take any
 * shadow of its own with it, so the shadow is the wrapper's.
 */
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Art />
      <div className="lift">
        <div className="panel">{children}</div>
      </div>
    </>
  );
}
