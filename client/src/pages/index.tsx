import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import { Post, Pagination as PaginationType } from "../types";
import { useAuthState } from "../context/auth";

interface PostsResponse {
  posts: Post[];
  pagination: PaginationType;
}

const Home: NextPage = () => {
  const [page, setPage] = useState(0);
  const { authenticated } = useAuthState();

  const { data, error, mutate } = useSWR<PostsResponse>(
    `/posts?page=${page}&count=10`
  );

  const { data: topForums } = useSWR("/forums/top");

  return (
    <>
      <Head>
        <title>LayerX Forum - 홈</title>
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content */}
          <main className="w-full md:w-8/12">
            {/* Create Post Banner */}
            {authenticated && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <Link href="/submit">
                    <a className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                      게시물 작성하기...
                    </a>
                  </Link>
                </div>
              </div>
            )}

            {/* Posts */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                게시물을 불러오는데 실패했습니다.
              </div>
            )}

            {!data && !error && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {data?.posts?.map((post) => (
              <PostCard key={post.identifier} post={post} mutate={mutate} />
            ))}

            {data?.pagination && (
              <Pagination
                pagination={data.pagination}
                onPageChange={(newPage) => setPage(newPage)}
              />
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full md:w-4/12">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-4">
              <h2 className="text-xl font-bold mb-2">LayerX Forum에 오신 것을 환영합니다!</h2>
              <p className="text-sm text-indigo-100 mb-4">
                다양한 주제로 토론하고, 지식을 공유하고, 커뮤니티와 소통하세요.
              </p>
              {!authenticated && (
                <div className="flex space-x-2">
                  <Link href="/register">
                    <a className="flex-1 px-4 py-2 bg-white text-indigo-600 rounded-lg text-center font-medium hover:bg-indigo-50 transition-colors">
                      가입하기
                    </a>
                  </Link>
                  <Link href="/login">
                    <a className="flex-1 px-4 py-2 border border-white text-white rounded-lg text-center font-medium hover:bg-white/10 transition-colors">
                      로그인
                    </a>
                  </Link>
                </div>
              )}
            </div>

            {/* Top Forums */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-indigo-600 px-4 py-3">
                <h3 className="text-white font-semibold">인기 포럼</h3>
              </div>
              <div className="divide-y">
                {topForums?.map((forum: any, index: number) => (
                  <Link key={forum.name} href={`/f/${forum.name}`}>
                    <a className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                      <span className="text-gray-500 text-sm w-6">
                        {index + 1}
                      </span>
                      <img
                        src={forum.imageUrl}
                        alt={forum.name}
                        className="w-8 h-8 rounded-full mx-2"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">f/{forum.name}</p>
                        <p className="text-xs text-gray-500">
                          {forum.postCount} 게시물
                        </p>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
              <Link href="/forums">
                <a className="block px-4 py-3 text-center text-sm text-indigo-600 hover:bg-gray-50 border-t">
                  모든 포럼 보기
                </a>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Home;
