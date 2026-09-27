import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://omaqnofqyorbrbowjkbr.supabase.co";
const supabaseKey = "sb_publishable_UgvhJdHSoRFjuQdb_ztYkQ_-HgmPnoz";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);