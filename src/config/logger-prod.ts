import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-file', // Use pino-file for structured logs in production
    options: {
      destination: './logs/app.log', // Set log file path
    },
  },
  level: 'info', // Set log level to 'info' in production
});

export default logger;