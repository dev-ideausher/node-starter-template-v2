const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const mongoose = require('mongoose');
let server;

mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    console.log('Connected to mongodb');
  })
  .catch(err => {
    console.log(err);
  });

// init server and store it in the server variable, previously it wasn't being stored in the var
server = app.listen(config.port, () => {
  console.log(`BNeighbourly app listening on port ${config.port}!`);
});

// ------------- Don't Modify  -------------
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = error => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
// ------------- Don't Modify  -------------
