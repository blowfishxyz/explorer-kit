import { initIdlsRefreshBackgroundJob } from "@/components/idls";
import { config } from "@/core/config";
import { initSharedDependencies } from "@/core/shared-dependencies";
import { app } from "@/server";

async function main() {
  try {
    await initSharedDependencies();
    initIdlsRefreshBackgroundJob(config.IDL_REFRESH_INTERVAL_MS);

    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    app.log.info(`Server started on port ${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
