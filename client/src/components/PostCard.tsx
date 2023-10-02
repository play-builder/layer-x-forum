import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { Post } from "../types";
import { useAuthState } from "../context/auth";
import { useRouter } from "next/router";
import axios from "axios";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface Props {
  post: Post;
  mutate?: () => void;
}

const PostCard = ({ post, mutate }: Props) => {
  const { authenticated } = useAuthState();
  const router = useRouter();

  const vote = async (value: number) => {
    if (!authenticated) {
      router.push("/login");
      return;
    }

    if (value === post.userVote) value = 0;

    try {
      await axios.post("/votes", {
        identifier: post.identifier,
        slug: post.slug,
        value,
      });
      if (mutate) mutate();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4">
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center justify-start w-12 py-4 bg-gray-50 rounded-l-lg">
          <button
            onClick={() => vote(1)}
            className={`p-1 rounded hover:bg-gray-200 transition-colors ${
              post.userVote === 1 ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <span
            className={`text-sm font-bold ${
              post.voteScore > 0
                ? "text-indigo-600"
                : post.voteScore < 0
                ? "text-red-500"
                : "text-gray-600"
            }`}
          >
            {post.voteScore}
          </span>
          <button
            onClick={() => vote(-1)}
            className={`p-1 rounded hover:bg-gray-200 transition-colors ${
              post.userVote === -1 ? "text-red-500" : "text-gray-400"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Meta Info */}
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Link href={`/f/${post.forumName}`}>
              <a className="font-medium text-indigo-600 hover:underline">
                f/{post.forumName}
              </a>
            </Link>
            <span className="mx-1">•</span>
            <span>Posted by</span>
            <Link href={`/u/${post.username}`}>
              <a className="ml-1 hover:underline">u/{post.username}</a>
            </Link>
            <span className="mx-1">•</span>
            <span>{dayjs(post.createdAt).fromNow()}</span>
          </div>

          {/* Title */}
          <Link href={post.url}>
            <a>
              <h2 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                {post.title}
              </h2>
            </a>
          </Link>

          {/* Body Preview */}
          {post.body && (
            <p className="mt-2 text-gray-600 text-sm line-clamp-3">
              {post.body}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center mt-3 space-x-4">
            <Link href={post.url}>
              <a className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-sm">{post.commentCount} 댓글</span>
              </a>
            </Link>
            <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span className="text-sm">공유</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
