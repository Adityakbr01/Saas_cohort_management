const isDev = import.meta.env.MODE !== "production"; // or process.env.NODE_ENV !== 'production'

type LogLevel = "info" | "warn" | "error" | "debug";

const logColorMap: Record<LogLevel, string> = {
  info: "color: blue",
  warn: "color: orange",
  error: "color: red",
  debug: "color: green",
};

const Logger = {
  info: (message: string, ...optionalParams: unknown[]) => {
    if (isDev) {
      console.info(`%c[AppLogger] INFO: ${message}`, logColorMap.info, ...optionalParams);
    }
  },
  warn: (message: string, ...optionalParams: unknown[]) => {
    if (isDev) {
      console.warn(`%c[AppLogger] WARN: ${message}`, logColorMap.warn, ...optionalParams);
    }
  },
  error: (message: string, ...optionalParams: unknown[]) => {
    if (isDev) {
      console.error(`%c[AppLogger] ERROR: ${message}`, logColorMap.error, ...optionalParams);
    }
  },
  debug: (message: string, ...optionalParams: unknown[]) => {
    if (isDev) {
      console.debug(`%c[AppLogger] DEBUG: ${message}`, logColorMap.debug, ...optionalParams);
    }
  },
  log: (message: string, ...optionalParams: unknown[]) => {
    if (isDev) {
      console.log(`%c[AppLogger] LOG: ${message}`, "color: gray", ...optionalParams);
    }
  },
};

export default Logger;
