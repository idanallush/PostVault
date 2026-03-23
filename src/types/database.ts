export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          url: string;
          platform: string;
          post_type: string;
          original_text: string | null;
          media_url: string | null;
          thumbnail_url: string | null;
          author_name: string | null;
          author_handle: string | null;
          ai_summary: string;
          ai_category: string;
          ai_key_points: string[];
          ai_content_type: string | null;
          ai_action_items: string[];
          is_favorite: boolean;
          personal_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          url: string;
          platform: string;
          post_type: string;
          ai_summary: string;
          ai_category: string;
          id?: string;
          original_text?: string | null;
          media_url?: string | null;
          thumbnail_url?: string | null;
          author_name?: string | null;
          author_handle?: string | null;
          ai_key_points?: string[];
          ai_content_type?: string | null;
          ai_action_items?: string[];
          is_favorite?: boolean;
          personal_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          url?: string;
          platform?: string;
          post_type?: string;
          original_text?: string | null;
          media_url?: string | null;
          thumbnail_url?: string | null;
          author_name?: string | null;
          author_handle?: string | null;
          ai_summary?: string;
          ai_category?: string;
          ai_key_points?: string[];
          ai_content_type?: string | null;
          ai_action_items?: string[];
          is_favorite?: boolean;
          personal_note?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          name: string;
          id?: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          color?: string;
        };
        Relationships: [];
      };
      posts_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
  };
};

// Application-level types (used in code, not by Supabase SDK)
export interface Post {
  id: string;
  url: string;
  platform: "instagram" | "facebook" | "youtube";
  post_type: "image" | "video" | "carousel" | "text";
  original_text: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  author_name: string | null;
  author_handle: string | null;
  ai_summary: string;
  ai_category: string;
  ai_key_points: string[];
  ai_content_type: string | null;
  ai_action_items: string[];
  is_favorite: boolean;
  personal_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}

export type InsertPost = {
  url: string;
  platform: string;
  post_type: string;
  ai_summary: string;
  ai_category: string;
  id?: string;
  original_text?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  author_name?: string | null;
  author_handle?: string | null;
  ai_key_points?: string[];
  ai_content_type?: string | null;
  ai_action_items?: string[];
  is_favorite?: boolean;
  personal_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type UpdatePost = {
  url?: string;
  platform?: string;
  post_type?: string;
  original_text?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  author_name?: string | null;
  author_handle?: string | null;
  ai_summary?: string;
  ai_category?: string;
  ai_key_points?: string[];
  ai_content_type?: string | null;
  ai_action_items?: string[];
  is_favorite?: boolean;
  personal_note?: string | null;
  updated_at?: string;
};

export type InsertTag = {
  name: string;
  id?: string;
  color?: string;
  created_at?: string;
};

export type UpdateTag = {
  name?: string;
  color?: string;
};

export interface PostWithTags extends Post {
  tags: Tag[];
}
