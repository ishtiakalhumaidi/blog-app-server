import { Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

router.get("/", postController.getAllPosts);
router.get("/my-posts", auth(UserRole.USER), postController.getMyPost);
router.get("/stats", auth(UserRole.ADMIN), postController.getStats);
router.get("/:id", postController.getPostById);

router.post("/", auth(UserRole.USER), postController.createPost);

router.patch(
  "/:post_id",
  auth(UserRole.ADMIN, UserRole.USER),
  postController.updatePost
);

router.delete(
  "/:post_id",
  auth(UserRole.ADMIN, UserRole.USER),
  postController.deletePost
);

export const postRouter: Router = router;
