import auth, { UserRole } from "../../middleware/auth";
import { commentController } from "./comment.controller";
import { Router } from "express";

const router = Router();

router.get(
  "/author/:author_id",
  auth(UserRole.ADMIN, UserRole.ADMIN),
  commentController.getCommentByAuthor
);

router.get(
  "/:comment_id",
  auth(UserRole.ADMIN, UserRole.ADMIN),
  commentController.getCommentById
);

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  commentController.createComment
);

router.patch(
  "/:comment_id",
  auth(UserRole.USER),
  commentController.updateComment
);
router.patch(
  "/:comment_id/moderate",
  auth(UserRole.ADMIN),
  commentController.moderateComment
);

router.delete(
  "/:comment_id",
  auth(UserRole.USER, UserRole.ADMIN),
  commentController.deleteComment
);

export const commentRouter: Router = router;
