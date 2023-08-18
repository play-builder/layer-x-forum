import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { User } from "../entities/User";
import Post from "../entities/Post";
import Vote from "../entities/Vote";
import Comment from "../entities/Comment";

const vote = async (req: Request, res: Response) => {
  const { identifier, slug, commentIdentifier, value } = req.body;

  // -1, 0, 1 값만 허용
  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ error: "-1, 0, 1의 값만 허용됩니다." });
  }

  try {
    const user: User = res.locals.user;
    let post: Post = await Post.findOneByOrFail({ identifier, slug });
    let vote: Vote | null;
    let comment: Comment | undefined;

    if (commentIdentifier) {
      // 댓글 투표
      comment = await Comment.findOneByOrFail({
        identifier: commentIdentifier,
      });
      vote = await Vote.findOneBy({
        username: user.username,
        commentId: comment.id,
      });
    } else {
      // 게시물 투표
      vote = await Vote.findOneBy({ username: user.username, postId: post.id });
    }

    if (!vote && value === 0) {
      // 투표가 없는데 0을 보내면 오류
      return res.status(404).json({ error: "투표를 찾을 수 없습니다." });
    } else if (!vote) {
      // 새 투표 생성
      vote = new Vote();
      vote.user = user;
      vote.username = user.username;
      vote.value = value;

      if (comment) {
        vote.comment = comment;
        vote.commentId = comment.id;
      } else {
        vote.post = post;
        vote.postId = post.id;
      }
      await vote.save();
    } else if (value === 0) {
      // 투표 취소
      await vote.remove();
    } else if (vote.value !== value) {
      // 투표 변경
      vote.value = value;
      await vote.save();
    }

    // 업데이트된 게시물 반환
    post = await Post.findOneOrFail({
      where: { identifier, slug },
      relations: ["comments", "comments.votes", "forum", "votes"],
    });

    post.setUserVote(user);
    post.comments.forEach((c) => c.setUserVote(user));

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const router = Router();
router.post("/", userMiddleware, authMiddleware, vote);
export default router;
