import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = "https://xtqjqvlvxnqwzxlmxbxe.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0cWpxdmx2eG5xd3p4bG14YnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA4NzI0NjAsImV4cCI6MjAyNjQ0ODQ2MH0.Gy5YmWGpHH6GdZKQhqMg8RL-Scj_9vKLEHHGVxl3Ync";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
