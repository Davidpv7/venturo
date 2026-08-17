"use client";

import { useState } from "react";
import { Field, inputClasses } from "@/components/ui/field";
import { MIN_PASSWORD_LENGTH, getPasswordStrength } from "@/lib/password";

const barColors = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-venturo-olive"];

export function PasswordField() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { score, label } = getPasswordStrength(password);
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <>
      <Field label="Password">
        <input
          name="password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          pattern=".*\d.*"
          title={`At least ${MIN_PASSWORD_LENGTH} characters, including one number`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
        {password && (
          <div className="mt-1 flex flex-col gap-1">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((segment) => (
                <div
                  key={segment}
                  className={[
                    "h-1.5 flex-1 rounded-full",
                    segment < score ? barColors[score] : "bg-venturo-olive/15",
                  ].join(" ")}
                />
              ))}
            </div>
            <p className="text-xs font-normal text-foreground/60">{label}</p>
          </div>
        )}
      </Field>

      <Field label="Confirm password">
        <input
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClasses}
        />
        {confirmMismatch && (
          <p className="mt-1 text-xs font-normal text-red-600">Passwords don&apos;t match</p>
        )}
      </Field>
    </>
  );
}
