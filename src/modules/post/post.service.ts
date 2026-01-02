import type { Post, PostStatus } from "../../../generated/prisma/client";
import type { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "author_id">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      author_id: userId,
    },
  });
  return result;
};

const getAllPosts = async (payload: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  author_id: string | undefined;
}) => {
  const andConditions: PostWhereInput[] = [];
  if (payload.search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: payload.search,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: payload.search,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: payload.search,
          },
        },
      ],
    });
  }
  if (payload.tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: payload.tags,
      },
    });
  }
  if (typeof payload.isFeatured === "boolean") {
    andConditions.push({
      isFeatured: payload.isFeatured,
    });
  }
  if (payload.status) {
    andConditions.push({
      status: payload.status,
    });
  }
  if (payload.author_id) {
    andConditions.push({
      author_id: payload.author_id,
    });
  }
  const result = await prisma.post.findMany({
    where: {
      AND: andConditions,
    },
  });
  return result;
};

export const postService = {
  createPost,
  getAllPosts,
};
