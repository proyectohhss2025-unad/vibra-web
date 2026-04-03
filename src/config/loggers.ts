import { configure } from "log4js";

configure({
  appenders: {
    console: {
      type: "console",
    },
    file: {
      type: "file",
      filename: "../../app.log",
    },
  },
  categories: {
    default: {
      appenders: ["console"],
      level: "info",
    }
  },
});
