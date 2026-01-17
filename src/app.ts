import express, { type Application } from "express";
import { postRouter } from "./modules/post/post.routers";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { commentRouter } from "./modules/comment/comment.router";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.APP_ORIGIN_URL,
    credentials: true,
  })
);

app.use("/api/v1/posts", postRouter);

app.use("/api/v1/comments", commentRouter);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get("/", (req, res) => {
  res.send("blog server is cooking...");
});

app.use(notFound);
app.use(errorHandler);

export default app;
