import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

const VerifyEmail = () => {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const res = await axios.post("/auth/verify-email", { token });
        setStatus("success");
        setMessage(res.data.message);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.error || "이메일 인증에 실패했습니다."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <>
      <Head>
        <title>이메일 인증 - LayerX Forum</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {status === "loading" && (
              <>
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  이메일 인증 중...
                </h1>
                <p className="text-gray-600">잠시만 기다려 주세요.</p>
              </>
            )}

            {status === "success" && (
              <>
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
                  인증 완료!
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link href="/login">
                  <a className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    로그인 페이지로 이동
                  </a>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  인증 실패
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <Link href="/login">
                    <a className="block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                      로그인 페이지로 이동
                    </a>
                  </Link>
                  <p className="text-sm text-gray-500">
                    인증 링크가 만료되었다면, 로그인 후 인증 이메일을 다시 요청할
                    수 있습니다.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
