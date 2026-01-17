import {
  CommentStatus,
  type Post,
  type PostStatus,
} from "../../../generated/prisma/client";
import type { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth";

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
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
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
      include: {
        comments: {
          where: {
            parent_id: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
                replies: {
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
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

const getMyPost = async (author_id: string) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: author_id,
      status: "ACTIVE",
    },
    select: { id: true },
  });
  const result = await prisma.post.findMany({
    where: {
      author_id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  return result;
};

const updatePost = async (
  id: string,
  data: Partial<Post>,
  author_id: string,
  isAdmin: boolean
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      author_id: true,
    },
  });
  if (!isAdmin && postData?.author_id !== author_id) {
    throw new Error("You are not author of the post.");
  }

  if (!isAdmin) {
    delete data.isFeatured;
  }

  return await prisma.post.update({
    where: {
      id,
      author_id,
    },
    data,
  });
};

const deletePost = async (id: string, author_id: string, isAdmin: boolean) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      author_id: true,
    },
  });

  if (!isAdmin && postData?.author_id !== author_id) {
    throw new Error("You are not author of the post.");
  }

  return await prisma.post.delete({
    where: {
      id,
    },
  });
};

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComment,
      rejectComment,
      totalUsers,
      adminCount,
      userCount,
      overAllViews,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({
        where: {
          status: "PUBLISHED",
        },
      }),

      await tx.post.count({
        where: {
          status: "DRAFT",
        },
      }),

      await tx.post.count({
        where: {
          status: "ARCHIVED",
        },
      }),

      await tx.comment.count(),
      await tx.comment.count({ where: { status: "APPROVED" } }),
      await tx.comment.count({ where: { status: "REJECT" } }),
      await tx.user.count(),
      await tx.user.count({
        where: { role: UserRole.ADMIN },
      }),
      await tx.user.count({
        where: { role: UserRole.USER },
      }),
      await tx.post.aggregate({
        _sum: { views: true },
      }),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComment,
      rejectComment,
      totalUsers,
      adminCount,
      userCount,
      overAllViews: overAllViews._sum.views,
    };
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPost,
  getStats,
  updatePost,
  deletePost,
};
