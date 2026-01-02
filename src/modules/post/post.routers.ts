import { Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.get("/", postController.getAllPosts);

router.post("/", auth(UserRole.USER), postController.createPost);

export const postRouter: Router = router;
