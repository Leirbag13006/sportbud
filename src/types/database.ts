/**
 * Types de la base Supabase, au format de `supabase gen types typescript`.
 * Doivent refléter exactement supabase/migrations/*.sql.
 * Une fois la CLI Supabase liée au projet, ce fichier peut être régénéré avec :
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          bio: string | null;
          sport_level: Database["public"]["Enums"]["sport_level"];
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          bio?: string | null;
          sport_level?: Database["public"]["Enums"]["sport_level"];
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          bio?: string | null;
          sport_level?: Database["public"]["Enums"]["sport_level"];
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          creator_id: string;
          sport_type: Database["public"]["Enums"]["sport_type"];
          description: string | null;
          location_name: string | null;
          lat: number;
          lng: number;
          starts_at: string;
          duration_minutes: number;
          required_level: Database["public"]["Enums"]["sport_level"] | null;
          spots_total: number;
          spots_available: number;
          status: Database["public"]["Enums"]["activity_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          sport_type: Database["public"]["Enums"]["sport_type"];
          description?: string | null;
          location_name?: string | null;
          lat: number;
          lng: number;
          starts_at: string;
          duration_minutes?: number;
          required_level?: Database["public"]["Enums"]["sport_level"] | null;
          spots_total: number;
          spots_available?: number;
          status?: Database["public"]["Enums"]["activity_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          sport_type?: Database["public"]["Enums"]["sport_type"];
          description?: string | null;
          location_name?: string | null;
          lat?: number;
          lng?: number;
          starts_at?: string;
          duration_minutes?: number;
          required_level?: Database["public"]["Enums"]["sport_level"] | null;
          status?: Database["public"]["Enums"]["activity_status"];
        };
        Relationships: [
          {
            foreignKeyName: "activities_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          id: string;
          activity_id: string;
          applicant_id: string;
          status: Database["public"]["Enums"]["application_status"];
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          applicant_id: string;
          status?: Database["public"]["Enums"]["application_status"];
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: Database["public"]["Enums"]["application_status"];
          message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "applications_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_applicant_id_fkey";
            columns: ["applicant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          application_id: string;
          sender_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          sender_id: string;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_activity_creator: {
        Args: { p_activity_id: string };
        Returns: boolean;
      };
      is_conversation_participant: {
        Args: { p_application_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      sport_level: "beginner" | "intermediate" | "pro";
      sport_type:
        | "football"
        | "basketball"
        | "tennis"
        | "padel"
        | "badminton"
        | "volleyball"
        | "running"
        | "cycling"
        | "swimming"
        | "climbing"
        | "fitness"
        | "other";
      activity_status: "open" | "full" | "cancelled";
      application_status: "pending" | "accepted" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

/** Ligne d'une table : `Tables<"profiles">`. */
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
/** Valeurs d'un type énuméré : `Enums<"sport_level">`. */
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];

export type Profile = Tables<"profiles">;
export type SportLevel = Enums<"sport_level">;
