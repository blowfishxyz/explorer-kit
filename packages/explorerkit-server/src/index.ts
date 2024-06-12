import { initSharedDependencies } from "@/core/shared-dependencies";
import { app } from "@/server";

// Start the server
const PORT = process.env["PORT"] ?? 3000;

async function main() {
  await initSharedDependencies();
  app.listen(PORT);

  // eslint-disable-next-line no-console
  console.log(`Server started on port ${PORT}`);
}

void main();
