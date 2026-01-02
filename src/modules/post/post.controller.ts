import type { Request, Response } from "express";
import { postService } from "./post.service";
import type { PostStatus } from "../../../generated/prisma/enums";

const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized!",
      });
    }
    const result = await postService.createPost(
      req.body,
      req.user.id as string
    );
    res.status(201).json({
      success: true,
      message: "post created successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    // if (!req.user) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Unauthorized!",
    //   });
    // }

    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;

    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
      : undefined;

    const status = req.query.status as PostStatus | undefined;
    const author_id = req.query.author_id as string | undefined;

    const result = await postService.getAllPosts({
      search: searchString,
      tags,
      isFeatured,
      status,
      author_id,
    });
    res.status(200).json({
      success: true,
      message: "posts retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const postController = {
  createPost,
  getAllPosts,
};
