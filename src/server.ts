import app from "./app";
import { connectDB } from "./db";
import * as dotenv from 'dotenv';
dotenv.config()

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});