const mongoose = require("mongoose");

const connectDB = async () => {
  const client = await mongoose.connect(process.env.MONGODB_URL);
  console.log(`database is connected`, client.connection.host);
};
module.exports = connectDB;
