import type { IncomingMessage, ServerResponse } from "http";
import app from "../src/app";
import { connectDB } from "../src/db";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await connectDB();
  app(req, res);
}
