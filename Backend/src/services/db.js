import mongoose from "mongoose";
import dotenv from "dotenv";
import { setServers } from "node:dns/promises";
setServers(["1.1.1.1","8.8.8.8"]);


dotenv.config();

const dbConnection = mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
    throw error;
  });

export default dbConnection;