import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Comment from "../entities/Comment";
import Vote from "../entities/Vote";
import { User } from "../entities/User";

// 댓글 수정
const updateComment = async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const { body } = req.body;
  const user: User = res.locals.user;

  try {
    if (!body || body.trim() === "") {
      return res.status(400).json({ body: "댓글 내용을 입력해주세요." });
    }

    const comment = await Comment.findOneOrFail({
      where: { identifier },
      relations: ["votes"],
    });

    // 작성자 확인
    if (comment.username !== user.username) {
      return res.status(403).json({ error: "수정 권한이 없습니다." });
    }

    comment.body = body;
    await comment.save();

    if (res.locals.user) {
      comment.setUserVote(res.locals.user);
    }

    return res.json(comment);
  } catch (error) {
    console.log(error);
    if ((error as any).name === "EntityNotFoundError") {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 댓글 삭제
const deleteComment = async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const user: User = res.locals.user;

  try {
    const comment = await Comment.findOneOrFail({
      where: { identifier },
      relations: ["votes"],
    });

    // 작성자 확인
    if (comment.username !== user.username) {
      return res.status(403).json({ error: "삭제 권한이 없습니다." });
    }

    // 관련 투표 삭제
    if (comment.votes && comment.votes.length > 0) {
      await Vote.remove(comment.votes);
    }

    await comment.remove();

    return res.json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    console.log(error);
    if ((error as any).name === "EntityNotFoundError") {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 단일 댓글 조회
const getComment = async (req: Request, res: Response) => {
  const { identifier } = req.params;

  try {
    const comment = await Comment.findOneOrFail({
      where: { identifier },
      relations: ["votes", "post"],
    });

    if (res.locals.user) {
      comment.setUserVote(res.locals.user);
    }

    return res.json(comment);
  } catch (error) {
    console.log(error);
    if ((error as any).name === "EntityNotFoundError") {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const router = Router();

// 공개 라우트
router.get("/:identifier", userMiddleware, getComment);

// 인증 필요 라우트
router.put("/:identifier", userMiddleware, authMiddleware, updateComment);
router.delete("/:identifier", userMiddleware, authMiddleware, deleteComment);

export default router;
