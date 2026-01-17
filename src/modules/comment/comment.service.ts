import { CommentStatus } from "./../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

type CreateComment = {
  content: string;
  author_id: string;
  post_id: string;
  parent_id?: string;
};
type UpdateComment = {
  content: string;
  status: CommentStatus;
};

const createComment = async (payload: CreateComment) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.post_id,
    },
  });
  if (payload.parent_id) {
    await prisma.comment.findUniqueOrThrow({
      where: {
        id: payload.parent_id,
      },
    });
  }

  const result = await prisma.comment.create({
    data: payload,
  });
  return result;
};

const getCommentById = async (id: string) => {
  return await prisma.comment.findUnique({
    where: {
      id,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
        },
      },
    },
  });
};

const getCommentByAuthor = async (author_id: string) => {
  return await prisma.comment.findMany({
    where: {
      author_id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });
};

const updateComment = async (
  id: string,
  author_id: string,
  data: UpdateComment
) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id,
      author_id,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("forbidden command!");
  }

  return await prisma.comment.update({
    where: {
      id,
    },
    data,
  });
};

const moderateComment = async (id: string, data: { status: CommentStatus }) => {
  const commentData = await prisma.comment.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (commentData.status === data.status) {
    throw new Error(
      `Your provided status (${data.status}) is already up to date`
    );
  }

  return await prisma.comment.update({
    where: {
      id,
    },
    data,
  });
};

const deleteComment = async (id: string, author_id: string) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id,
      author_id,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("forbidden command!");
  }

  return await prisma.comment.delete({
    where: {
      id,
    },
  });
};

export const commentService = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  updateComment,
  moderateComment,
  deleteComment,
};
