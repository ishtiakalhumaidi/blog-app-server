import type { NextFunction, Request, Response } from "express";
import { postService } from "./post.service";
import type { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middleware/auth";

const createPost = async (req: Request, res: Response, next: NextFunction) => {
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
    next(error);
  }
};

const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
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

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query
    );

    const result = await postService.getAllPosts({
      search: searchString,
      tags,
      isFeatured,
      status,
      author_id,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "posts retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await postService.getPostById(id as string);

    res.status(200).json({
      success: true,
      message: "post retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};
const getMyPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized!",
      });
    }
    const result = await postService.getMyPost(user?.id as string);

    res.status(200).json({
      success: true,
      message: "posts retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};
const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized!",
      });
    }
    const isAdmin = user.role === UserRole.ADMIN;

    const { post_id } = req.params;
    const result = await postService.updatePost(
      post_id as string,
      req.body,
      user.id,
      isAdmin
    );

    res.status(200).json({
      success: true,
      message: "post update successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized!",
      });
    }
    const isAdmin = user.role === UserRole.ADMIN;

    const { post_id } = req.params;
    const result = await postService.deletePost(
      post_id as string,
      user.id,
      isAdmin
    );

    res.status(200).json({
      success: true,
      message: "post delete successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};
const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await postService.getStats();

    res.status(200).json({
      success: true,
      message: "stats fetch successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const postController = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPost,
  getStats,
  updatePost,
  deletePost,
};
