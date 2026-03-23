export type {
  Database,
  Post,
  Tag,
  PostTag,
  InsertPost,
  UpdatePost,
  InsertTag,
  UpdateTag,
  PostWithTags,
} from "./database";

export type Platform = "instagram" | "facebook" | "youtube";

export type PostType = "image" | "video" | "carousel" | "text";

export type ContentType =
  | "tutorial"
  | "educational"
  | "inspirational"
  | "news"
  | "review"
  | "recipe"
  | "tip"
  | "entertainment"
  | "other";

export interface AnalysisResult {
  summary: string;
  category: string;
  key_points: string[];
  content_type: ContentType;
  action_items: string[];
  suggested_tags: string[];
}

export interface ScrapedContent {
  platform: Platform;
  postType: PostType;
  text: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  authorName: string | null;
  authorHandle: string | null;
  originalUrl: string;
  scrapedSuccessfully: boolean;
  needsManualInput: boolean;
  error?: string;
}
