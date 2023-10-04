import Head from "next/head";
import Link from "next/link";
import { FormEvent, useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await axios.post("/auth/forgot-password", { email });
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
          <title>이메일 발송 완료 - LayerX Forum</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                이메일을 확인해 주세요
              </h1>
              <p className="text-gray-600 mb-6">
                입력하신 이메일로 비밀번호 재설정 링크를 보내드렸습니다.
                <br />
                (등록된 이메일인 경우)
              </p>
              <Link href="/login">
                <a className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  로그인 페이지로 돌아가기
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
        <title>비밀번호 찾기 - LayerX Forum</title>
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
              비밀번호 찾기
            </h1>
            <p className="text-gray-600 mb-6">
              가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                  placeholder="이메일을 입력하세요"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {errors.error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {errors.error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "전송 중..." : "재설정 링크 보내기"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login">
                <a className="text-indigo-600 font-medium hover:underline">
                  ← 로그인으로 돌아가기
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
