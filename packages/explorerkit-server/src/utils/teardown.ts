type TeardownFn = () => void | Promise<void>;

const teardownFns: TeardownFn[] = [];

export const onTeardown = (fn: TeardownFn): void => {
  teardownFns.push(fn);
};

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    for (const fn of teardownFns) {
      await fn();
    }

    process.exit(process.exitCode ?? 0);
  });
});
