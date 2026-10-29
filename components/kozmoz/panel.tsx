import { Art } from "@/components/kozmoz/art";

/**
 * The page as a sheet of paper floating over the gold (Art): every page puts
 * its header, main and footer inside. kozmoz.css sets its margin, corners,
 * shadow and edge, and the lift it rises in with ("the panel").
 */
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Art />
      <div className="panel">{children}</div>
    </>
  );
}
