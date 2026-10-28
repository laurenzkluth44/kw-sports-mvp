import type {
  AppRole,
  AttackPosition,
  CoachRole,
  DefensePosition,
  Language,
  League,
  NeedType,
  PlayerNeedStatus,
  PlayerType,
  Priority,
  Season,
  TargetRole
} from "./domain";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string;
          name: string;
          country: string;
          league: League;
          city: string;
          website: string | null;
          logo_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country?: string;
          league: League;
          city: string;
          website?: string | null;
          logo_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          league?: League;
          city?: string;
          website?: string | null;
          logo_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          club_id: string | null;
          name: string;
          email: string;
          role: AppRole;
          agency_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          club_id?: string | null;
          name: string;
          email: string;
          role: AppRole;
          agency_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string | null;
          name?: string;
          email?: string;
          role?: AppRole;
          agency_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };
      player_needs: {
        Row: {
          id: string;
          club_id: string;
          season: Season;
          need_type: NeedType;
          attack_positions: AttackPosition[];
          defense_positions: DefensePosition[];
          coach_role: CoachRole | null;
          needed_from_date: string;
          priority: Priority;
          status: PlayerNeedStatus;
          description: string | null;
          age_min: number | null;
          age_max: number | null;
          height_min: number | null;
          nationality_preference: string | null;
          league_experience: string | null;
          player_type: string | null;
          player_types: PlayerType[];
          target_roles: TargetRole[];
          languages: Language[];
          contract_status_preference: string | null;
          budget_amount: number | null;
          budget_currency: string | null;
          budget_note: string | null;
          status_note: string | null;
          closed_at: string | null;
          last_confirmed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          season: Season;
          need_type?: NeedType;
          attack_positions?: AttackPosition[];
          defense_positions?: DefensePosition[];
          coach_role?: CoachRole | null;
          needed_from_date: string;
          priority: Priority;
          status?: PlayerNeedStatus;
          description?: string | null;
          age_min?: number | null;
          age_max?: number | null;
          height_min?: number | null;
          nationality_preference?: string | null;
          league_experience?: string | null;
          player_type?: string | null;
          player_types?: PlayerType[];
          target_roles?: TargetRole[];
          languages?: Language[];
          contract_status_preference?: string | null;
          budget_amount?: number | null;
          budget_currency?: string | null;
          budget_note?: string | null;
          status_note?: string | null;
          closed_at?: string | null;
          last_confirmed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          season?: Season;
          need_type?: NeedType;
          attack_positions?: AttackPosition[];
          defense_positions?: DefensePosition[];
          coach_role?: CoachRole | null;
          needed_from_date?: string;
          priority?: Priority;
          status?: PlayerNeedStatus;
          description?: string | null;
          age_min?: number | null;
          age_max?: number | null;
          height_min?: number | null;
          nationality_preference?: string | null;
          league_experience?: string | null;
          player_type?: string | null;
          player_types?: PlayerType[];
          target_roles?: TargetRole[];
          languages?: Language[];
          contract_status_preference?: string | null;
          budget_amount?: number | null;
          budget_currency?: string | null;
          budget_note?: string | null;
          status_note?: string | null;
          closed_at?: string | null;
          last_confirmed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_needs_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };
      roster_players: {
        Row: {
          id: string;
          club_id: string;
          first_name: string;
          last_name: string;
          jersey_number: number | null;
          position: AttackPosition;
          secondary_positions: AttackPosition[];
          defense_positions: DefensePosition[];
          contract_until: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          first_name: string;
          last_name: string;
          jersey_number?: number | null;
          position: AttackPosition;
          secondary_positions?: AttackPosition[];
          defense_positions?: DefensePosition[];
          contract_until: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          first_name?: string;
          last_name?: string;
          jersey_number?: number | null;
          position?: AttackPosition;
          secondary_positions?: AttackPosition[];
          defense_positions?: DefensePosition[];
          contract_until?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roster_players_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };
      player_need_confidential: {
        Row: {
          player_need_id: string;
          note: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          player_need_id: string;
          note: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          player_need_id?: string;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_need_confidential_player_need_id_fkey";
            columns: ["player_need_id"];
            isOneToOne: true;
            referencedRelation: "player_needs";
            referencedColumns: ["id"];
          }
        ];
      };
      admin_notes: {
        Row: {
          id: string;
          player_need_id: string;
          admin_id: string | null;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_need_id: string;
          admin_id?: string | null;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_need_id?: string;
          admin_id?: string | null;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_notes_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_notes_player_need_id_fkey";
            columns: ["player_need_id"];
            isOneToOne: false;
            referencedRelation: "player_needs";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          club_id: string | null;
          player_need_id: string | null;
          action: string;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          club_id?: string | null;
          player_need_id?: string | null;
          action: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          club_id?: string | null;
          player_need_id?: string | null;
          action?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_player_need_id_fkey";
            columns: ["player_need_id"];
            isOneToOne: false;
            referencedRelation: "player_needs";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      agency_count: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      current_user_club_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: AppRole | null;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_agency: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      club_league: League;
      attack_position: AttackPosition;
      need_type: NeedType;
      player_need_priority: Priority;
      player_need_status: PlayerNeedStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
