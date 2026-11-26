/* eslint-disable no-console -- this module is the single place allowed to write to the console. */
type Level = "info" | "warn" | "error";
type Fields = Record<string, unknown>;

function write(level: Level, message: string, fields?: Fields) {
  const line = JSON.stringify({ level, message, ...fields, at: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (message: string, fields?: Fields) => write("info", message, fields),
  warn: (message: string, fields?: Fields) => write("warn", message, fields),
  error: (message: string, fields?: Fields) => write("error", message, fields),
};
