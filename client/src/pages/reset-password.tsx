import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState, useEffect } from "react";
import axios from "axios";

const ResetPassword = () => {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "비밀번호가 일치하지 않습니다." });
      setLoading(false);
      return;
    }

    try {
      await axios.post("/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      setSuccess(true);
    } catch (error: any) {
      setErrors(error.response?.data || { error: "요청에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Head>
          <title>비밀번호 변경 완료 - LayerX Forum</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                비밀번호가 변경되었습니다
              </h1>
              <p className="text-gray-600 mb-6">
                새 비밀번호로 로그인해 주세요.
              </p>
              <Link href="/login">
                <a className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  로그인 페이지로 이동
                </a>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>비밀번호 재설정 - LayerX Forum</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <a className="inline-flex items-center space-x-2">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-indigo-600 font-bold text-xl">LX</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  LayerX Forum
                </span>
              </a>
            </Link>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              새 비밀번호 설정
            </h1>
            <p className="text-gray-600 mb-6">새로운 비밀번호를 입력해 주세요.</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                  placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {errors.error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {errors.error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
