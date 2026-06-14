import { cp, mkdir, rm } from "node:fs/promises";

const files = ["index.html", "styles.css", "app.js", "assets"];

await rm("dist", { force: true, recursive: true });
await mkdir("dist", { recursive: true });

await Promise.all(files.map((file) => cp(file, `dist/${file}`, { recursive: true })));
