export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      funds: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          description: string;
          transparency: "public" | "private" | "all";
          approval_threshold: number;
          creator_address: string;
          contract_fund_id: string;
          total_contributions: string;
          pending_withdrawals: string;
          contributor_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          description: string;
          transparency: "public" | "private" | "all";
          approval_threshold: number;
          creator_address: string;
          contract_fund_id: string;
          total_contributions?: string;
          pending_withdrawals?: string;
          contributor_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          description?: string;
          transparency?: "public" | "private" | "all";
          approval_threshold?: number;
          creator_address?: string;
          contract_fund_id?: string;
          total_contributions?: string;
          pending_withdrawals?: string;
          contributor_count?: number;
        };
      };
      contributions: {
        Row: {
          id: string;
          created_at: string;
          fund_id: string;
          contributor_address: string;
          amount: string;
          transaction_hash: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          fund_id: string;
          contributor_address: string;
          amount: string;
          transaction_hash: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          fund_id?: string;
          contributor_address?: string;
          amount?: string;
          transaction_hash?: string;
        };
      };
      withdrawal_requests: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          fund_id: string;
          requester_address: string;
          amount: string;
          reason: string;
          status: "pending" | "approved" | "rejected";
          transaction_hash: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          fund_id: string;
          requester_address: string;
          amount: string;
          reason: string;
          status?: "pending" | "approved" | "rejected";
          transaction_hash?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          fund_id?: string;
          requester_address?: string;
          amount?: string;
          reason?: string;
          status?: "pending" | "approved" | "rejected";
          transaction_hash?: string | null;
        };
      };
      request_votes: {
        Row: {
          id: string;
          created_at: string;
          request_id: string;
          voter_address: string;
          vote_type: "approve" | "reject";
        };
        Insert: {
          id?: string;
          created_at?: string;
          request_id: string;
          voter_address: string;
          vote_type: "approve" | "reject";
        };
        Update: {
          id?: string;
          created_at?: string;
          request_id?: string;
          voter_address?: string;
          vote_type?: "approve" | "reject";
        };
      };
    };
  };
}
