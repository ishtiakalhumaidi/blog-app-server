import express, { type Application } from "express";
import { postRouter } from "./modules/post/post.routers";

const app: Application = express();

app.use(express.json())

app.use("/api/v1/posts", postRouter)




app.get("/", (req, res) => {
  res.send("blog server is cooking...");
});



app.use((req, res) => {
  res.status(404).json({
    message: "No path has been found",
    path: req.path,
  });
});

export default app;
