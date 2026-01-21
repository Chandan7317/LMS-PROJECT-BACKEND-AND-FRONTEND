const { v2 } = require("cloudinary");
const app = require("./app");
const connectDB = require("./src/config/database");

// & Cloudinary configuration
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, (err) => {
      if (err) {
        console.log("Error while staring Server", err);
        process.exit(1); //close the server /process with failure
      }
      console.log("Server running port No", process.env.PORT);
    });
  })
  .catch(() => {
    console.log("Error while connecting to database", process.env.MONGODB_URL);
    process.exit(1); //close the server /process with failure
  });
