import type {
  AppRole,
  AttackPosition,
  CoachRole,
  DefensePosition,
  Language,
  League,
  NeedFillSource,
  NeedMatchStatus,
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
      kw_player_games: {
        Row: {
          id: string;
          player_id: string;
          competition: string;
          game_date: string;
          game: string | null;
          games: number;
          goals: number | null;
          shots: number | null;
          seven_goals: number | null;
          assists: number | null;
          steals: number | null;
          blocks: number | null;
          turnovers: number | null;
          two_min: number | null;
          hpi: number | null;
          saves: number | null;
          goals_against: number | null;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          competition: string;
          game_date: string;
          game?: string | null;
          games?: number;
          goals?: number | null;
          shots?: number | null;
          seven_goals?: number | null;
          assists?: number | null;
          steals?: number | null;
          blocks?: number | null;
          turnovers?: number | null;
          two_min?: number | null;
          hpi?: number | null;
          saves?: number | null;
          goals_against?: number | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          competition?: string;
          game_date?: string;
          game?: string | null;
          games?: number;
          goals?: number | null;
          shots?: number | null;
          seven_goals?: number | null;
          assists?: number | null;
          steals?: number | null;
          blocks?: number | null;
          turnovers?: number | null;
          two_min?: number | null;
          hpi?: number | null;
          saves?: number | null;
          goals_against?: number | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kw_player_games_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "kw_players";
            referencedColumns: ["id"];
          }
        ];
      };
      kw_players: {
        Row: {
          id: string;
          kind: NeedType;
          first_name: string;
          last_name: string;
          birth_date: string | null;
          nationality: string | null;
          attack_positions: AttackPosition[];
          defense_positions: DefensePosition[];
          coach_roles: string[];
          handedness: string | null;
          height_cm: number | null;
          current_club: string | null;
          current_league: string | null;
          contract_until: string | null;
          available_from: string | null;
          languages: string[];
          player_types: string[];
          league_experience: string | null;
          profile: string | null;
          video_url: string | null;
          photo_path: string | null;
          cv_path: string | null;
          consent_at: string | null;
          visible_to_clubs: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kind?: NeedType;
          first_name: string;
          last_name: string;
          birth_date?: string | null;
          nationality?: string | null;
          attack_positions?: AttackPosition[];
          defense_positions?: DefensePosition[];
          coach_roles?: string[];
          handedness?: string | null;
          height_cm?: number | null;
          current_club?: string | null;
          current_league?: string | null;
          contract_until?: string | null;
          available_from?: string | null;
          languages?: string[];
          player_types?: string[];
          league_experience?: string | null;
          profile?: string | null;
          video_url?: string | null;
          photo_path?: string | null;
          cv_path?: string | null;
          consent_at?: string | null;
          visible_to_clubs?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kind?: NeedType;
          first_name?: string;
          last_name?: string;
          birth_date?: string | null;
          nationality?: string | null;
          attack_positions?: AttackPosition[];
          defense_positions?: DefensePosition[];
          coach_roles?: string[];
          handedness?: string | null;
          height_cm?: number | null;
          current_club?: string | null;
          current_league?: string | null;
          contract_until?: string | null;
          available_from?: string | null;
          languages?: string[];
          player_types?: string[];
          league_experience?: string | null;
          profile?: string | null;
          video_url?: string | null;
          photo_path?: string | null;
          cv_path?: string | null;
          consent_at?: string | null;
          visible_to_clubs?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      need_matches: {
        Row: {
          id: string;
          need_id: string;
          player_id: string;
          status: NeedMatchStatus;
          score: number;
          reasons: Json;
          club_note: string | null;
          released_at: string;
          released_by: string | null;
          responded_at: string | null;
          responded_by: string | null;
          handled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          player_id: string;
          status?: NeedMatchStatus;
          score?: number;
          reasons?: Json;
          club_note?: string | null;
          released_at?: string;
          released_by?: string | null;
          responded_at?: string | null;
          responded_by?: string | null;
          handled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          player_id?: string;
          status?: NeedMatchStatus;
          score?: number;
          reasons?: Json;
          club_note?: string | null;
          released_at?: string;
          released_by?: string | null;
          responded_at?: string | null;
          responded_by?: string | null;
          handled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "need_matches_need_id_fkey";
            columns: ["need_id"];
            isOneToOne: false;
            referencedRelation: "player_needs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "need_matches_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "kw_players";
            referencedColumns: ["id"];
          }
        ];
      };
      need_outcomes: {
        Row: {
          need_id: string;
          filled_via: NeedFillSource;
          kw_player_id: string | null;
          noted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          need_id: string;
          filled_via: NeedFillSource;
          kw_player_id?: string | null;
          noted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          need_id?: string;
          filled_via?: NeedFillSource;
          kw_player_id?: string | null;
          noted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "need_outcomes_need_id_fkey";
            columns: ["need_id"];
            isOneToOne: true;
            referencedRelation: "player_needs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "need_outcomes_kw_player_id_fkey";
            columns: ["kw_player_id"];
            isOneToOne: false;
            referencedRelation: "kw_players";
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
      respond_to_need_match: {
        Args: { match_id: string; answer: NeedMatchStatus; note?: string | null };
        Returns: undefined;
      };
      club_can_see_kw_player: {
        Args: { target: string };
        Returns: boolean;
      };
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
      need_match_status: NeedMatchStatus;
      need_fill_source: NeedFillSource;
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
