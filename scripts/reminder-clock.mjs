// Local stand-in for the every-minute scheduler, for testing on your computer.
// (Once deployed, Supabase pg_cron does this job instead.)
// Run it in a second terminal while `npm run dev` is running:  npm run reminders

const URL = "http://localhost:3000/api/send-reminders";
const ONE_MINUTE = 60_000;

const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error("Missing CRON_SECRET in .env.local");
  process.exit(1);
}

async function tick() {
  const time = new Date().toLocaleTimeString();
  try {
    const response = await fetch(URL, { headers: { Authorization: `Bearer ${secret}` } });
    console.log(time, response.status, await response.text());
  } catch {
    console.log(time, "Could not reach the app. Is `npm run dev` running?");
  }
}

console.log("Checking for due reminders every minute. Press Ctrl+C to stop.");
tick();
setInterval(tick, ONE_MINUTE);
