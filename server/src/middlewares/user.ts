import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";

export default async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const token = req.cookies.token;
    if (!token) return next();

    const { username }: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const user = await User.findOneBy({ username });

    if (!user) throw new Error("Unauthenticated");

    // 유저 정보를 res.locals.user에 저장
    res.locals.user = user;
    return next();
  } catch (error) {
    console.log(error);
    return next();
  }
};
