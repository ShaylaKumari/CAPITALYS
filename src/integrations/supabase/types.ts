export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      decision_history: {
        Row: {
          changed_at: string
          goal_id: string
          id: string
          indicator_changed: string | null
          new_explanation: string | null
          new_indicator_value: number | null
          new_strategy: string
          old_indicator_value: number | null
          previous_explanation: string | null
          previous_strategy: string
          reason: string | null
        }
        Insert: {
          changed_at?: string
          goal_id: string
          id?: string
          indicator_changed?: string | null
          new_explanation?: string | null
          new_indicator_value?: number | null
          new_strategy: string
          old_indicator_value?: number | null
          previous_explanation?: string | null
          previous_strategy: string
          reason?: string | null
        }
        Update: {
          changed_at?: string
          goal_id?: string
          id?: string
          indicator_changed?: string | null
          new_explanation?: string | null
          new_indicator_value?: number | null
          new_strategy?: string
          old_indicator_value?: number | null
          previous_explanation?: string | null
          previous_strategy?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_history_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_results: {
        Row: {
          analysis_date: string
          created_at: string
          explanation: string
          explanation_title: string | null
          goal_id: string
          id: string
          ranking: Json
          recommended_strategy: string
        }
        Insert: {
          analysis_date?: string
          created_at?: string
          explanation: string
          explanation_title?: string | null
          goal_id: string
          id?: string
          ranking: Json
          recommended_strategy: string
        }
        Update: {
          analysis_date?: string
          created_at?: string
          explanation?: string
          explanation_title?: string | null
          goal_id?: string
          id?: string
          ranking?: Json
          recommended_strategy?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_results_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      economic_indicators: {
        Row: {
          created_at: string
          id: string
          indicator_type: string
          reference_date: string
          source: string | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          indicator_type: string
          reference_date: string
          source?: string | null
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          indicator_type?: string
          reference_date?: string
          source?: string | null
          value?: number
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          asset_type: string
          available_capital: number
          created_at: string
          desired_term: number
          estimated_value: number
          id: string
          is_active: boolean
          updated_at: string
          urgency_level: string
          user_id: string
        }
        Insert: {
          asset_type: string
          available_capital?: number
          created_at?: string
          desired_term: number
          estimated_value: number
          id?: string
          is_active?: boolean
          updated_at?: string
          urgency_level: string
          user_id: string
        }
        Update: {
          asset_type?: string
          available_capital?: number
          created_at?: string
          desired_term?: number
          estimated_value?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          urgency_level?: string
          user_id?: string
        }
        Relationships: []
      }
      indicator_analysis: {
        Row: {
          created_at: string
          current_value: number
          id: string
          indicator_type: string
          trend: string | null
          variation: number | null
        }
        Insert: {
          created_at?: string
          current_value: number
          id?: string
          indicator_type: string
          trend?: string | null
          variation?: number | null
        }
        Update: {
          created_at?: string
          current_value?: number
          id?: string
          indicator_type?: string
          trend?: string | null
          variation?: number | null
        }
        Relationships: []
      }
      insights: {
        Row: {
          created_at: string
          id: string
          insight_text: string
          scenario_label: string
          scenario_summary: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          insight_text: string
          scenario_label: string
          scenario_summary?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          insight_text?: string
          scenario_label?: string
          scenario_summary?: string | null
        }
        Relationships: []
      }
      partner_interest: {
        Row: {
          created_at: string
          decision_result_id: string | null
          goal_id: string
          id: string
          selected_strategy: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decision_result_id?: string | null
          goal_id: string
          id?: string
          selected_strategy: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decision_result_id?: string | null
          goal_id?: string
          id?: string
          selected_strategy?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_interest_decision_result_id_fkey"
            columns: ["decision_result_id"]
            isOneToOne: false
            referencedRelation: "decision_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_interest_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_financial_profile: {
        Row: {
          created_at: string
          credit_status: string | null
          dependents: number | null
          id: string
          income_range: string | null
          income_stability: string | null
          profession: string | null
          risk_profile: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_status?: string | null
          dependents?: number | null
          id?: string
          income_range?: string | null
          income_stability?: string | null
          profession?: string | null
          risk_profile?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_status?: string | null
          dependents?: number | null
          id?: string
          income_range?: string | null
          income_stability?: string | null
          profession?: string | null
          risk_profile?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      view_latest_economic_indicators: {
        Row: {
          created_at: string | null
          id: string | null
          indicator_type: string | null
          reference_date: string | null
          source: string | null
          value: number | null
        }
        Relationships: []
      }
      view_latest_indicator_analysis: {
        Row: {
          created_at: string | null
          current_value: number | null
          id: string | null
          indicator_type: string | null
          trend: string | null
          variation: number | null
        }
        Relationships: []
      }
      view_latest_insight: {
        Row: {
          created_at: string | null
          id: string | null
          insight_text: string | null
          scenario_label: string | null
          scenario_summary: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
