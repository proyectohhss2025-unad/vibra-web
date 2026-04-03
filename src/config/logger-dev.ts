import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty', // Use PrettyStream as the transport target
    options: {
      colorize: true, // Enable colorized logs
      destination: './app.log',
    },
  },
  level: 'info', // Set log level based on environment
});

export default logger;