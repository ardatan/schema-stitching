import { startServer } from "./gateway";

startServer().catch(e => {
  console.error(e);
  process.exit(1);
});
