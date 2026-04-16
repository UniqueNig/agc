import mongoose from "mongoose";

declare global {
  var mongooseCache:
    | {
        connection: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const mongoCache = globalThis.mongooseCache ?? {
  connection: null,
  promise: null,
};

globalThis.mongooseCache = mongoCache;

mongoose.set("bufferCommands", false);

const CONNECTION_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  family: 4,
};

const getMongoUris = () => {
  const primaryUri = process.env.MONGO_DB_URI?.trim();
  const fallbackUri = process.env.MONGO_DB_URI_FALLBACK?.trim();
  const uris = [primaryUri, fallbackUri].filter(Boolean) as string[];

  if (!uris.length) {
    throw new Error("MONGO_DB_URI is not configured.");
  }

  return uris;
};

const buildConnectionError = (error: unknown, uri: string) => {
  const errorCode =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
  const syscall =
    typeof error === "object" && error && "syscall" in error
      ? String(error.syscall)
      : "";
  const message =
    error instanceof Error ? error.message : "MongoDB connection failed.";

  if (
    uri.startsWith("mongodb+srv://") &&
    (errorCode === "ECONNREFUSED" ||
      errorCode === "ENOTFOUND" ||
      syscall === "querySrv")
  ) {
    return new Error(
      "MongoDB Atlas host lookup failed. Your network could not resolve the Atlas cluster host. Use a standard mongodb:// connection string in MONGO_DB_URI or provide MONGO_DB_URI_FALLBACK for a direct connection."
    );
  }

  return new Error(message);
};

export async function connectDB() {
  if (mongoCache.connection) {
    return mongoCache.connection;
  }

  if (!mongoCache.promise) {
    const uris = getMongoUris();

    mongoCache.promise = (async () => {
      let lastError: Error | null = null;

      for (const uri of uris) {
        try {
          const connection = await mongoose.connect(uri, CONNECTION_OPTIONS);
          console.log("MongoDB Connected");
          return connection;
        } catch (error) {
          lastError = buildConnectionError(error, uri);
          console.error(lastError.message, "MongoDB Connection Failed");
        }
      }

      throw lastError ?? new Error("MongoDB connection failed.");
    })();
  }

  try {
    mongoCache.connection = await mongoCache.promise;
    return mongoCache.connection;
  } catch (error) {
    mongoCache.promise = null;
    throw error;
  }
}
