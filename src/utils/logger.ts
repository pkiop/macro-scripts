import dayjs from "dayjs";
import winston from "winston";
import Transport from "winston-transport";
const { combine, timestamp, printf } = winston.format;

class SendToFE extends Transport {
  constructor() {
    super();
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  log(info: any, callback: any) {
    // console.log("info :", info);

    setImmediate(() => {
      this.emit("logged", info);
    });

    // ipcMain.emit(
    //   "log-updated-for-fe",
    //   null,
    //   `${dayjs(info.timestamp).format("YYMMDD_HHmmss")}[${info.level}]:${
    //     info.message
    //   }`
    // );
    // Perform the writing to the remote service
    callback();
  }
}

export const loggerDate = dayjs(new Date()).format("YYMMDD_HHmmss");
const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp(),
    printf(({ level, message, timestamp }) => {
      return `${dayjs(timestamp).format(
        "YY-MM-DD HH:mm:ss"
      )} ${level}: ${message}`;
    })
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({
      filename: `logs/error-${loggerDate}.log`,
      level: "error",
    }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    new winston.transports.File({
      filename: `logs/total-${loggerDate}.log`,
      //   filename: `logs/total.log`,
    }),

    new SendToFE(),
  ],
});

export default logger;
