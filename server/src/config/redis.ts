import {Redis} from "ioredis"
import dotenv from "dotenv";
dotenv.config();
// BullMQ needs maxRetriesPerRequest: null on the connection it's given

export const connection = new Redis(process.env.REDIS_URI!,{maxRetriesPerRequest: null,});
await connection.set('foo', 'bar');