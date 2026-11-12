import { Suspense } from "react";
import { login, signup } from "./actions";

export const metadata = { title: "Log in · Habit Tracker" };

export default function LoginPage({ searchParams }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <form className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold">Habit Tracker</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Log in or create an account to track your habits.
        </p>

        {/* The ?error= / ?message= part of the URL is only known per request,
            so it's read inside <Suspense>. */}
        <Suspense>
          <StatusMessage searchParams={searchParams} />
        </Suspense>

        {/* Not "required": this form is shared with Log in, which doesn't need it.
            The signup action checks it instead. */}
        <label className="flex flex-col gap-1 text-sm font-medium">
          <span>
            Username{" "}
            <span className="font-normal text-zinc-500">(only needed to sign up)</span>
          </span>
          <input
            name="username"
            type="text"
            autoComplete="username"
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>

        {/* Both buttons submit the same form; formAction picks which server action runs. */}
        <div className="mt-2 flex gap-3">
          <button
            formAction={login}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Log in
          </button>
          <button
            formAction={signup}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Sign up
          </button>
        </div>
      </form>
    </main>
  );
}

async function StatusMessage({ searchParams }) {
  const { error, message } = await searchParams;

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
        {message}
      </p>
    );
  }
  return null;
}
