import { sendDueReminders } from "@/lib/reminders";

// Called every minute by a scheduler: `npm run reminders` on your computer,
// Supabase pg_cron once deployed. The CRON_SECRET password stops strangers
// from triggering it.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return Response.json(await sendDueReminders());
  } catch (err) {
    console.error("send-reminders failed:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
