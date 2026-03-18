type Context = Record<string, unknown>;

function write(
  level: "error" | "info" | "warn",
  message: string,
  context?: Context,
) {
  console[level](
    JSON.stringify({
      context: context ?? {},
      level,
      message,
      timestamp: new Date().toISOString(),
    }),
  );
}

export const logger = {
  error(message: string, context?: Context) {
    write("error", message, context);
  },
  info(message: string, context?: Context) {
    write("info", message, context);
  },
  warn(message: string, context?: Context) {
    write("warn", message, context);
  },
};
