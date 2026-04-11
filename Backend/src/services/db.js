import mongoose from "mongoose";
import dotenv from "dotenv";
import { Resolver, setServers } from "node:dns/promises";

dotenv.config();
setServers(["1.1.1.1", "8.8.8.8"]);

const mongoUri = process.env.MONGO_URI?.trim();
const connectionOptions = {
  serverSelectionTimeoutMS: 10000,
};

const shouldTrySrvFallback = (uri, error) => {
  if (!uri?.startsWith("mongodb+srv://")) {
    return false;
  }

  const message = String(error?.message || "");
  return message.includes("queryTxt") || message.includes("querySrv");
};

const buildStandardMongoUriFromSrv = async (srvUri) => {
  const source = new URL(srvUri);
  const resolver = new Resolver();
  resolver.setServers(["1.1.1.1", "8.8.8.8"]);

  const srvRecords = await resolver.resolveSrv(
    `_mongodb._tcp.${source.hostname}`
  );

  if (!srvRecords?.length) {
    throw new Error("No SRV records found for MongoDB cluster.");
  }

  const hosts = srvRecords
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => `${entry.name}:${entry.port}`)
    .join(",");

  const params = new URLSearchParams(source.searchParams);
  if (!params.has("tls")) params.set("tls", "true");
  if (!params.has("retryWrites")) params.set("retryWrites", "true");
  if (!params.has("w")) params.set("w", "majority");

  const username = encodeURIComponent(decodeURIComponent(source.username));
  const password = encodeURIComponent(decodeURIComponent(source.password));
  const databasePath =
    source.pathname && source.pathname !== "/" ? source.pathname : "/";

  return `mongodb://${username}:${password}@${hosts}${databasePath}?${params.toString()}`;
};

const connectDatabase = async () => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  try {
    await mongoose.connect(mongoUri, connectionOptions);
    console.log("Connected to MongoDB");
    return mongoose.connection;
  } catch (error) {
    if (!shouldTrySrvFallback(mongoUri, error)) {
      console.error("MongoDB connection error:", error.message);
      throw error;
    }

    try {
      console.warn(
        "MongoDB SRV/TXT lookup failed, trying standard connection string fallback..."
      );
      const fallbackUri = await buildStandardMongoUriFromSrv(mongoUri);
      await mongoose.connect(fallbackUri, connectionOptions);
      console.log("Connected to MongoDB using SRV fallback");
      return mongoose.connection;
    } catch (fallbackError) {
      console.error("MongoDB connection error:", fallbackError.message);
      throw fallbackError;
    }
  }
};

export default connectDatabase;
