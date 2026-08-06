"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { MBA_ENTRANCE_EXAMS } from "@/lib/validation";

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone"),
      college: formData.get("college"),
      course: formData.get("course"),
      targetExam: formData.get("targetExam"),
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        setPending(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-ink">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-brand-ink">
          Contact number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="e.g. 9876543210"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="college" className="block text-sm font-medium text-brand-ink">
          College
        </label>
        <input
          id="college"
          name="college"
          type="text"
          required
          autoComplete="organization"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="course" className="block text-sm font-medium text-brand-ink">
          Course
        </label>
        <input
          id="course"
          name="course"
          type="text"
          required
          placeholder="e.g. B.Com, B.E. Computer Science"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="targetExam" className="block text-sm font-medium text-brand-ink">
          MBA entrance exam
        </label>
        <select id="targetExam" name="targetExam" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select an exam
          </option>
          {MBA_ENTRANCE_EXAMS.map((exam) => (
            <option key={exam} value={exam}>
              {exam}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-brand-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-brand-ink/50">At least 8 characters.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-gold px-4 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light disabled:opacity-60"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-brand-ink/70">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-navy hover:text-brand-gold">
          Log in
        </Link>
      </p>
    </form>
  );
}
