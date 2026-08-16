export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string;
          actor_id: string | null;
          created_at: string;
          id: string;
          message: string;
          prospect_id: string | null;
        };
        Insert: {
          activity_type?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          message: string;
          prospect_id?: string | null;
        };
        Update: {
          activity_type?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          message?: string;
          prospect_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "activities_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
        ];
      };
      follow_ups: {
        Row: {
          assigned_to: string | null;
          created_at: string;
          created_by: string | null;
          due_at: string;
          id: string;
          note: string | null;
          prospect_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string;
          created_by?: string | null;
          due_at?: string;
          id?: string;
          note?: string | null;
          prospect_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string;
          created_by?: string | null;
          due_at?: string;
          id?: string;
          note?: string | null;
          prospect_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follow_ups_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prospect_stage_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          created_at: string;
          from_stage_id: string | null;
          id: string;
          note: string | null;
          prospect_id: string;
          to_stage_id: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          created_at?: string;
          from_stage_id?: string | null;
          id?: string;
          note?: string | null;
          prospect_id: string;
          to_stage_id: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          created_at?: string;
          from_stage_id?: string | null;
          id?: string;
          note?: string | null;
          prospect_id?: string;
          to_stage_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prospect_stage_history_from_stage_id_fkey";
            columns: ["from_stage_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prospect_stage_history_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prospect_stage_history_to_stage_id_fkey";
            columns: ["to_stage_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
        ];
      };
      prospects: {
        Row: {
          address: string | null;
          alternative_phone: string | null;
          assigned_to: string | null;
          business_name: string | null;
          contact_name: string;
          created_at: string;
          created_by: string | null;
          designation: string | null;
          email: string | null;
          id: string;
          is_active: boolean;
          notes: string | null;
          phone: string | null;
          service_id: string | null;
          stage_id: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          alternative_phone?: string | null;
          assigned_to?: string | null;
          business_name?: string | null;
          contact_name: string;
          created_at?: string;
          created_by?: string | null;
          designation?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          phone?: string | null;
          service_id?: string | null;
          stage_id?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          alternative_phone?: string | null;
          assigned_to?: string | null;
          business_name?: string | null;
          contact_name?: string;
          created_at?: string;
          created_by?: string | null;
          designation?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          phone?: string | null;
          service_id?: string | null;
          stage_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prospects_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prospects_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
        ];
      };
      sales: {
        Row: {
          agent_id: string | null;
          amount: number;
          closed_at: string;
          created_at: string;
          id: string;
          paid_amount: number;
          prospect_id: string | null;
          service_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          agent_id?: string | null;
          amount?: number;
          closed_at?: string;
          created_at?: string;
          id?: string;
          paid_amount?: number;
          prospect_id?: string | null;
          service_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          agent_id?: string | null;
          amount?: number;
          closed_at?: string;
          created_at?: string;
          id?: string;
          paid_amount?: number;
          prospect_id?: string | null;
          service_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stages: {
        Row: {
          color: string | null;
          created_at: string;
          icon: string | null;
          id: string;
          is_active: boolean;
          is_follow_up: boolean;
          is_system: boolean | null;
          name: string;
          sort_order: number;
          stage_group: string;
          updated_at: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          is_follow_up?: boolean;
          is_system?: boolean | null;
          name: string;
          sort_order?: number;
          stage_group?: string;
          updated_at?: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          is_follow_up?: boolean;
          is_system?: boolean | null;
          name?: string;
          sort_order?: number;
          stage_group?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      prospect_stage_history_details: {
        Row: {
          changed_at: string | null;
          changed_by: string | null;
          changer_email: string | null;
          changer_name: string | null;
          from_stage_id: string | null;
          from_stage_name: string | null;
          id: string | null;
          note: string | null;
          prospect_business: string | null;
          prospect_id: string | null;
          prospect_name: string | null;
          to_stage_id: string | null;
          to_stage_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prospect_stage_history_from_stage_id_fkey";
            columns: ["from_stage_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prospect_stage_history_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prospect_stage_history_to_stage_id_fkey";
            columns: ["to_stage_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      change_prospect_stage: {
        Args: { p_note?: string; p_prospect_id: string; p_stage_id: string };
        Returns: Json;
      };
      dashboard_metrics: { Args: never; Returns: Json };
      dashboard_recent_prospects: {
        Args: { per_group?: number };
        Returns: {
          business_name: string;
          contact_name: string;
          created_at: string;
          id: string;
          service_name: string;
          stage_group: string;
          stage_name: string;
        }[];
      };
      follow_up_summary: { Args: never; Returns: Json };
      get_stage_management_summary: { Args: never; Returns: Json };
      get_stages_with_counts: {
        Args: never;
        Returns: {
          color: string;
          icon: string;
          id: string;
          is_active: boolean;
          is_follow_up: boolean;
          is_system: boolean;
          name: string;
          prospect_count: number;
          prospect_percentage: number;
          sort_order: number;
          stage_group: string;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      set_follow_up_status: {
        Args: { p_follow_up_id: string; p_note?: string; p_status: string };
        Returns: Json;
      };
    };
    Enums: {
      app_role: "admin" | "agent";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "agent"],
    },
  },
} as const;
