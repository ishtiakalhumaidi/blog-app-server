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
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
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
    take: payload.limit,
    skip: payload.skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [payload.sortBy]: payload.sortOrder,
    },
  });

  const total = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    posts: result,
    pagination: {
      total,
      page: payload.page,
      limit: payload.limit,
      totalPages: Math.ceil(total / payload.limit),
    },
  };
};

const getPostById = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const postData = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });
    await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    return postData;
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
};
