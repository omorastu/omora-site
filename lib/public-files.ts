import fs from "node:fs";
import path from "node:path";

/**
 * Whether a file under public/ (given by its URL path) is there, checked on
 * the server as the page is built. For media that's listed before it exists
 * (loop cuts, portraits): the page shows what's there and drops in the rest
 * once the file is added and the site rebuilt.
 */
export const onDisk = (src: string) => fs.existsSync(path.join(process.cwd(), "public", src));
