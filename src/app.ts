import express from "express";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index";
import { errorMiddleware } from "./middlewares/error.middleware";
import { swaggerSpec } from "./swagger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

app.use(routes);
app.use(errorMiddleware);

export default app;
