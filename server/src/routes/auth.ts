import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/email";

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};

// 현재 사용자 정보
const me = async (_: Request, res: Response) => {
  return res.json(res.locals.user);
};

// 회원가입
const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    // 이메일과 유저이름 중복 확인
    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });

    if (emailUser) errors.email = "이미 해당 이메일 주소가 사용되었습니다.";
    if (usernameUser) errors.username = "이미 이 사용자 이름이 사용되었습니다.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;

    // 유효성 검사
    errors = await validate(user);
    if (errors.length > 0) return res.status(400).json(mapError(errors));

    // 이메일 인증 토큰 생성
    const verificationToken = user.generateEmailVerificationToken();

    // 사용자 저장
    await user.save();

    // 인증 이메일 발송
    try {
      await sendVerificationEmail(email, username, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // 이메일 발송 실패해도 회원가입은 완료
    }

    return res.json({
      message:
        "회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해 주세요.",
      user: { username: user.username, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 이메일 인증
const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: "인증 토큰이 필요합니다." });
    }

    const hashedToken = User.hashToken(token);

    const user = await User.findOne({
      where: {
        emailVerificationToken: hashedToken,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "유효하지 않은 인증 토큰입니다." });
    }

    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < new Date()
    ) {
      return res.status(400).json({ error: "인증 토큰이 만료되었습니다." });
    }

    // 이메일 인증 완료
    user.isEmailVerified = true;
    user.emailVerificationToken = null as any;
    user.emailVerificationExpires = null as any;
    await user.save();

    return res.json({ message: "이메일 인증이 완료되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 인증 이메일 재발송
const resendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "이미 인증된 이메일입니다." });
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    await sendVerificationEmail(email, user.username, verificationToken);

    return res.json({ message: "인증 이메일이 재발송되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 로그인
const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    let errors: any = {};

    if (isEmpty(username))
      errors.username = "사용자 이름은 비워둘 수 없습니다.";
    if (isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOneBy({ username });

    if (!user)
      return res
        .status(404)
        .json({ username: "사용자 이름이 등록되지 않았습니다." });

    // 비밀번호 확인
    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({ password: "비밀번호가 잘못되었습니다." });
    }

    // 이메일 인증 확인 (선택적 - 필요시 주석 해제)
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     error: "이메일 인증이 필요합니다.",
    //     needsVerification: true,
    //   });
    // }

    // 토큰 생성
    const token = jwt.sign({ username }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    // 쿠키 설정
    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: "/",
      })
    );

    return res.json({ user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 로그아웃
const logout = async (_: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );
  res.status(200).json({ success: true });
};

// 비밀번호 재설정 요청
const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOneBy({ email });

    if (!user) {
      // 보안을 위해 사용자 존재 여부와 관계없이 동일한 메시지 반환
      return res.json({
        message:
          "해당 이메일로 비밀번호 재설정 링크가 발송되었습니다. (등록된 이메일인 경우)",
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    try {
      await sendPasswordResetEmail(email, user.username, resetToken);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      user.passwordResetToken = null as any;
      user.passwordResetExpires = null as any;
      await user.save();
      return res.status(500).json({ error: "이메일 발송에 실패했습니다." });
    }

    return res.json({
      message: "비밀번호 재설정 링크가 이메일로 발송되었습니다.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 비밀번호 재설정
const resetPassword = async (req: Request, res: Response) => {
  const { token, password, confirmPassword } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: "재설정 토큰이 필요합니다." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "비밀번호는 6자리 이상이어야 합니다." });
    }

    const hashedToken = User.hashToken(token);

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "유효하지 않은 재설정 토큰입니다." });
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      return res.status(400).json({ error: "재설정 토큰이 만료되었습니다." });
    }

    // 비밀번호 변경
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = null as any;
    user.passwordResetExpires = null as any;
    await user.save();

    return res.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 비밀번호 변경 (로그인 상태)
const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user: User = res.locals.user;

  try {
    // 현재 비밀번호 확인
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "현재 비밀번호가 올바르지 않습니다." });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "새 비밀번호가 일치하지 않습니다." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "비밀번호는 6자리 이상이어야 합니다." });
    }

    // 새 비밀번호 설정
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

const router = Router();

// 공개 라우트
router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// 인증 필요 라우트
router.get("/me", userMiddleware, authMiddleware, me);
router.post("/logout", userMiddleware, authMiddleware, logout);
router.post("/change-password", userMiddleware, authMiddleware, changePassword);

export default router;
