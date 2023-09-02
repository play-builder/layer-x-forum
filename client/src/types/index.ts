export interface User {
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
}

export interface Forum {
  id: number;
  name: string;
  title: string;
  description: string;
  imageUrn: string;
  bannerUrn: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  bannerUrl?: string;
  posts: Post[];
}

export interface Post {
  id: number;
  identifier: string;
  title: string;
  slug: string;
  body: string;
  forumName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  commentCount: number;
  voteScore: number;
  userVote: number;
  forum?: Forum;
}

export interface Comment {
  id: number;
  identifier: string;
  body: string;
  username: string;
  postId: number;
  createdAt: string;
  updatedAt: string;
  voteScore: number;
  userVote: number;
  post?: Post;
}

export interface Pagination {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  posts?: T[];
  comments?: T[];
  forums?: T[];
  userData?: T[];
  pagination: Pagination;
}
