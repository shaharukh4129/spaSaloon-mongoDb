const mongoose = require('mongoose');
const connectDatabase = () => {
  mongoose.connect(process.env.DATABASE,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //useFindAndModify: true, 
      // useCreateIndex: true

    }).then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
  mongoose.set('debug', true);
}

module.exports = connectDatabase;