import type { Request, Response } from "express";
import { commentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new Error("Must login!");
    }
    const user = req.user;
    req.body.author_id = user.id;
    const result = await commentService.createComment(req.body);
    res.status(201).json({
      success: true,
      message: "comment created successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getCommentById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new Error("Must login!");
    }
    const { comment_id } = req.params;
    const result = await commentService.getCommentById(comment_id as string);

    res.status(200).json({
      success: true,
      message: "comment retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getCommentByAuthor = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new Error("Must login!");
    }
    const { author_id } = req.params;
    const result = await commentService.getCommentByAuthor(author_id as string);

    res.status(200).json({
      success: true,
      message: "comments retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new Error("Must login!");
    }
    const user = req.user;
    const { comment_id } = req.params;
    const result = await commentService.updateComment(
      comment_id as string,
      user.id as string,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "comment update successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const moderateComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new Error("Must login!");
    }
    const { comment_id } = req.params;
    const result = await commentService.moderateComment(
      comment_id as string,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "comment update successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new Error("Must login!");
    }
    const user = req.user;
    const { comment_id } = req.params;
    const result = await commentService.deleteComment(
      comment_id as string,
      user.id as string
    );

    res.status(200).json({
      success: true,
      message: "comment deleted successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  updateComment,
  moderateComment,
  deleteComment,
};
