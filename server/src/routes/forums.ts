import { NextFunction, Request, Response, Router } from "express";
import { User } from "../entities/User";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import Forum from "../entities/Forum";
import Post from "../entities/Post";
import multer, { FileFilterCallback } from "multer";
import { makeId } from "../utils/helpers";
import path from "path";
import fs from "fs";

// 포럼 조회
const getForum = async (req: Request, res: Response) => {
  const name = req.params.name;
  const currentPage: number = parseInt(req.query.page as string) || 0;
  const perPage: number = parseInt(req.query.count as string) || 10;

  try {
    const forum = await Forum.findOneByOrFail({ name });

    // 해당 포럼의 게시물 (페이지네이션)
    const [posts, total] = await Post.findAndCount({
      where: { forumName: forum.name },
      order: { createdAt: "DESC" },
      relations: ["comments", "votes"],
      skip: currentPage * perPage,
      take: perPage,
    });

    forum.posts = posts;

    if (res.locals.user) {
      forum.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json({
      forum,
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
    return res.status(404).json({ error: "포럼을 찾을 수 없습니다." });
  }
};

// 포럼 생성
const createForum = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  try {
    let errors: any = {};
    if (isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
    if (isEmpty(title)) errors.title = "제목은 비워둘 수 없습니다.";

    // 이름 중복 확인
    const existingForum = await AppDataSource.getRepository(Forum)
      .createQueryBuilder("forum")
      .where("lower(forum.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (existingForum) errors.name = "이미 존재하는 포럼 이름입니다.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user: User = res.locals.user;

    const forum = new Forum();
    forum.name = name;
    forum.description = description;
    forum.title = title;
    forum.user = user;
    forum.username = user.username;

    await forum.save();
    return res.status(201).json(forum);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 인기 포럼 목록
const topForums = async (req: Request, res: Response) => {
  try {
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || f."imageUrn", 'https://www.gravatar.com/avatar?d=mp&f=y')`;
    const forums = await AppDataSource.createQueryBuilder()
      .select(
        `f.title, f.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Forum, "f")
      .leftJoin(Post, "p", `f.name = p."forumName"`)
      .groupBy('f.title, f.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC")
      .limit(5)
      .execute();
    return res.json(forums);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 포럼 소유자 확인 미들웨어
const ownForum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user: User = res.locals.user;
  try {
    const forum = await Forum.findOneByOrFail({ name: req.params.name });

    if (forum.username !== user.username) {
      return res.status(403).json({ error: "이 포럼의 소유자가 아닙니다." });
    }

    res.locals.forum = forum;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 이미지 업로드 설정
const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images",
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname));
    },
  }),
  fileFilter: (_, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback(new Error("이미지 파일만 업로드 가능합니다."));
    }
  },
});

// 포럼 이미지 업로드
const uploadForumImage = async (req: Request, res: Response) => {
  const forum: Forum = res.locals.forum;
  try {
    const type = req.body.type;

    if (type !== "image" && type !== "banner") {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "잘못된 유형입니다." });
    }

    let oldImageUrn: string = "";
    if (type === "image") {
      oldImageUrn = forum.imageUrn || "";
      forum.imageUrn = req.file?.filename || "";
    } else if (type === "banner") {
      oldImageUrn = forum.bannerUrn || "";
      forum.bannerUrn = req.file?.filename || "";
    }

    await forum.save();

    // 기존 이미지 삭제
    if (oldImageUrn !== "") {
      const fullFilename = path.resolve(
        process.cwd(),
        "public",
        "images",
        oldImageUrn
      );
      if (fs.existsSync(fullFilename)) {
        fs.unlinkSync(fullFilename);
      }
    }

    return res.json(forum);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

// 모든 포럼 목록
const getAllForums = async (req: Request, res: Response) => {
  const currentPage: number = parseInt(req.query.page as string) || 0;
  const perPage: number = parseInt(req.query.count as string) || 20;

  try {
    const [forums, total] = await Forum.findAndCount({
      order: { createdAt: "DESC" },
      skip: currentPage * perPage,
      take: perPage,
    });

    return res.json({
      forums,
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

// 공개 라우트
router.get("/", userMiddleware, getAllForums);
router.get("/top", topForums);
router.get("/:name", userMiddleware, getForum);

// 인증 필요 라우트
router.post("/", userMiddleware, authMiddleware, createForum);
router.post(
  "/:name/upload",
  userMiddleware,
  authMiddleware,
  ownForum,
  upload.single("file"),
  uploadForumImage
);

export default router;
