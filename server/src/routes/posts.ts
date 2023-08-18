import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Forum from "../entities/Forum";
import Post from "../entities/Post";
import Comment from "../entities/Comment";
import { User } from "../entities/User";

// 게시물 목록 조회 (페이지네이션)
const getPosts = async (req: Request, res: Response) => {
  const currentPage: number = parseInt(req.query.page as string) || 0;
  const perPage: number = parseInt(req.query.count as string) || 10;

  try {
    const [posts, total] = await Post.findAndCount({
      order: { createdAt: "DESC" },
      relations: ["forum", "votes", "comments"],
      skip: currentPage * perPage,
      take: perPage,
    });

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json({
      posts,
      pagination: {
        currentPage,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        hasNext: (currentPage + 1) * perPage < total,
        hasPrev: currentPage > 0,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 단일 게시물 조회
const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    const post = await Post.findOneOrFail({
      where: { identifier, slug },
      relations: ["forum", "votes", "comments"],
    });

    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
  }
};

// 게시물 생성
const createPost = async (req: Request, res: Response) => {
  const { title, body, forum } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ title: "제목은 비워둘 수 없습니다." });
  }

  const user: User = res.locals.user;

  try {
    const forumRecord = await Forum.findOneByOrFail({ name: forum });
    const post = new Post();
    post.title = title;
    post.body = body;
    post.user = user;
    post.username = user.username;
    post.forum = forumRecord;
    post.forumName = forumRecord.name;

    await post.save();

    return res.status(201).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 게시물 수정
const updatePost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const { title, body } = req.body;
  const user: User = res.locals.user;

  try {
    const post = await Post.findOneOrFail({
      where: { identifier, slug },
    });

    // 작성자 확인
    if (post.username !== user.username) {
      return res.status(403).json({ error: "수정 권한이 없습니다." });
    }

    // 제목 유효성 검사
    if (title !== undefined) {
      if (!title || title.trim() === "") {
        return res.status(400).json({ title: "제목은 비워둘 수 없습니다." });
      }
      post.title = title;
    }

    // 본문 수정
    if (body !== undefined) {
      post.body = body;
    }

    await post.save();

    // 관계 데이터 포함하여 반환
    const updatedPost = await Post.findOneOrFail({
      where: { id: post.id },
      relations: ["forum", "votes", "comments"],
    });

    if (res.locals.user) {
      updatedPost.setUserVote(res.locals.user);
    }

    return res.json(updatedPost);
  } catch (error) {
    console.log(error);
    if ((error as any).name === "EntityNotFoundError") {
      return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
    }
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 게시물 삭제
const deletePost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const user: User = res.locals.user;

  try {
    const post = await Post.findOneOrFail({
      where: { identifier, slug },
      relations: ["comments", "votes"],
    });

    // 작성자 확인
    if (post.username !== user.username) {
      return res.status(403).json({ error: "삭제 권한이 없습니다." });
    }

    // 관련 댓글과 투표 삭제 (cascade 설정이 없는 경우)
    if (post.comments && post.comments.length > 0) {
      await Comment.remove(post.comments);
    }

    // 게시물 삭제
    await post.remove();

    return res.json({ message: "게시물이 삭제되었습니다." });
  } catch (error) {
    console.log(error);
    if ((error as any).name === "EntityNotFoundError") {
      return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
    }
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 게시물 댓글 조회 (페이지네이션)
const getPostComments = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const currentPage: number = parseInt(req.query.page as string) || 0;
  const perPage: number = parseInt(req.query.count as string) || 20;

  try {
    const post = await Post.findOneByOrFail({ identifier, slug });

    const [comments, total] = await Comment.findAndCount({
      where: { postId: post.id },
      order: { createdAt: "DESC" },
      relations: ["votes"],
      skip: currentPage * perPage,
      take: perPage,
    });

    if (res.locals.user) {
      comments.forEach((c) => c.setUserVote(res.locals.user));
    }

    return res.json({
      comments,
      pagination: {
        currentPage,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        hasNext: (currentPage + 1) * perPage < total,
        hasPrev: currentPage > 0,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 댓글 생성
const createPostComment = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const { body } = req.body;
  const user: User = res.locals.user;

  if (!body || body.trim() === "") {
    return res.status(400).json({ body: "댓글 내용을 입력해주세요." });
  }

  try {
    const post = await Post.findOneByOrFail({ identifier, slug });

    const comment = new Comment();
    comment.body = body;
    comment.user = user;
    comment.username = user.username;
    comment.post = post;
    comment.postId = post.id;

    await comment.save();

    return res.status(201).json(comment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const router = Router();

// 공개 라우트 (userMiddleware로 로그인 사용자 정보 주입)
router.get("/", userMiddleware, getPosts);
router.get("/:identifier/:slug", userMiddleware, getPost);
router.get("/:identifier/:slug/comments", userMiddleware, getPostComments);

// 인증 필요 라우트
router.post("/", userMiddleware, authMiddleware, createPost);
router.put("/:identifier/:slug", userMiddleware, authMiddleware, updatePost);
router.delete("/:identifier/:slug", userMiddleware, authMiddleware, deletePost);
router.post(
  "/:identifier/:slug/comments",
  userMiddleware,
  authMiddleware,
  createPostComment
);

export default router;
