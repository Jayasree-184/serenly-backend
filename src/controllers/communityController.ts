import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'
import { CommunityPostSchema, CommunityReportSchema } from '../validators/index.js'

export async function getPosts(_req: AuthenticatedRequest, res: Response) {
  const posts = await prisma.communityPost.findMany({
    where: { isModerated: false },
    include: {
      user: {
        select: { displayName: true },
      },
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  res.json({
    posts: posts.map((p) => ({
      id: p.id,
      content: p.content,
      author: p.user.displayName,
      createdAt: p.createdAt,
      commentsCount: p._count.comments,
    })),
  })
}

export async function createPost(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const data = CommunityPostSchema.parse(req.body)

  const post = await prisma.communityPost.create({
    data: {
      userId,
      content: data.content,
    },
    include: {
      user: { select: { displayName: true } },
    },
  })

  res.status(201).json({
    post: {
      id: post.id,
      content: post.content,
      author: post.user.displayName,
      createdAt: post.createdAt,
      commentsCount: 0,
    },
  })
}

export async function deletePost(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const id = String(req.params.id)

  const post = await prisma.communityPost.findUnique({
    where: { id },
  })

  if (!post || post.userId !== userId) {
    res.status(404).json({ error: 'NotFound', message: 'Post not found or unauthorized.' })
    return
  }

  await prisma.communityPost.delete({ where: { id } })
  res.json({ message: 'Post removed peacefully.' })
}

export async function reportPost(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId
  const data = CommunityReportSchema.parse(req.body)

  await prisma.communityReport.create({
    data: {
      reporterId: userId,
      postId: data.postId,
      reason: data.reason,
    },
  })

  res.status(201).json({ message: 'Report received. Our moderation guardians will review.' })
}
