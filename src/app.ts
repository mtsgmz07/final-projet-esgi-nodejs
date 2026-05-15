import express, { Request, Response, NextFunction } from "express";
import routes from "./routes/index";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.use(errorMiddleware);

export default app;