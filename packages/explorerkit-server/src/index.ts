import { initIdlsRefreshBackgroundJob } from "@/components/idls";
import { config } from "@/core/config";
import { initSharedDependencies } from "@/core/shared-dependencies";
import { app } from "@/server";

async function main() {
  await initSharedDependencies();
  initIdlsRefreshBackgroundJob(config.IDL_REFRESH_INTERVAL_MS);
  app.listen(config.PORT);

  // eslint-disable-next-line no-console
  console.log(`Server started on port ${config.PORT}`);
}

void main();
