import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import userMiddleware from "../middlewares/user";
import Post from "../entities/Post";
import Comment from "../entities/Comment";

// 사용자 데이터 조회
const getUserData = async (req: Request, res: Response) => {
  const currentPage: number = parseInt(req.query.page as string) || 0;
  const perPage: number = parseInt(req.query.count as string) || 10;

  try {
    // 유저 정보 가져오기
    const user = await User.findOneOrFail({
      where: { username: req.params.username },
      select: ["username", "createdAt", "isEmailVerified"],
    });

    // 유저가 쓴 포스트 정보 가져오기
    const posts = await Post.find({
      where: { username: user.username },
      relations: ["comments", "votes", "forum"],
      order: { createdAt: "DESC" },
    });

    // 유저가 쓴 댓글 정보 가져오기
    const comments = await Comment.find({
      where: { username: user.username },
      relations: ["post", "votes"],
      order: { createdAt: "DESC" },
    });

    if (res.locals.user) {
      const currentUser = res.locals.user;
      posts.forEach((p) => p.setUserVote(currentUser));
      comments.forEach((c) => c.setUserVote(currentUser));
    }

    // 데이터 병합 및 정렬
    let userData: any[] = [];
    posts.forEach((p) => userData.push({ type: "Post", ...p.toJSON() }));
    comments.forEach((c) => userData.push({ type: "Comment", ...c.toJSON() }));

    // 최신순 정렬
    userData.sort((a, b) => {
      if (b.createdAt > a.createdAt) return 1;
      if (b.createdAt < a.createdAt) return -1;
      return 0;
    });

    // 페이지네이션 적용
    const total = userData.length;
    const paginatedData = userData.slice(
      currentPage * perPage,
      (currentPage + 1) * perPage
    );

    return res.json({
      user,
      userData: paginatedData,
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

const router = Router();
router.get("/:username", userMiddleware, getUserData);

export default router;
