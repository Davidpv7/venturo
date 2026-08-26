import { requireUser } from "@/lib/require-user";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { ConfirmForm } from "@/components/ui/confirm-form";
import {
  updateEmail,
  updateProfile,
  updateEmergencyContact,
  updateNotificationPreferences,
  deleteAccount,
} from "./actions";

const emailErrors: Record<string, string> = {
  "confirmation-failed": "That confirmation link is invalid or has expired — try again.",
};

const deleteErrors: Record<string, string> = {
  "active-lease":
    "You have an active lease, so your account can't be deleted yet — contact an admin to end it first.",
};

export default async function AccountProfilePage({
  searchParams,
}: {
  searchParams: Promise<{
    emailChangeSent?: string;
    emailConfirmed?: string;
    emailError?: string;
    deleteError?: string;
  }>;
}) {
  const dbUser = await requireUser();
  const { emailChangeSent, emailConfirmed, emailError, deleteError } = await searchParams;

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Account
      </h1>
      <p className="mt-2 text-foreground/60">{dbUser.email}</p>

      <Card className="mt-8">
        <h2 className="font-semibold text-foreground">Profile</h2>
        <form action={updateProfile} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[10rem] flex-1">
              <Field label="First name">
                <input
                  name="name"
                  type="text"
                  defaultValue={dbUser.name ?? ""}
                  className={inputClasses}
                />
              </Field>
            </div>
            <div className="min-w-[10rem] flex-1">
              <Field label="Last name">
                <input
                  name="lastName"
                  type="text"
                  defaultValue={dbUser.lastName ?? ""}
                  className={inputClasses}
                />
              </Field>
            </div>
          </div>
          <Field label="Phone number">
            <input
              name="phone"
              type="tel"
              defaultValue={dbUser.phone ?? ""}
              className={inputClasses}
            />
          </Field>
          <Button type="submit" className="self-start">
            Save
          </Button>
        </form>

        <div className="mt-6 border-t border-venturo-olive/10 pt-4">
          {emailChangeSent && (
            <p className="mb-3 rounded-md bg-venturo-olive/10 px-3 py-2.5 text-sm text-venturo-olive">
              Check your inbox — we&apos;ve sent a confirmation link to your new email address.
              It won&apos;t take effect until you click it.
            </p>
          )}
          {emailConfirmed && (
            <p className="mb-3 rounded-md bg-venturo-olive/10 px-3 py-2.5 text-sm text-venturo-olive">
              Your email address has been updated.
            </p>
          )}
          {emailError && (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {emailErrors[emailError] ?? emailError}
            </p>
          )}
          <form action={updateEmail} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1">
              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  defaultValue={dbUser.email}
                  required
                  className={inputClasses}
                />
              </Field>
            </div>
            <Button type="submit">Save</Button>
          </form>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">Emergency Contact</h2>
        <form action={updateEmergencyContact} className="mt-4 flex flex-col gap-4">
          <Field label="Name">
            <input
              name="emergencyContactName"
              type="text"
              defaultValue={dbUser.emergencyContactName ?? ""}
              className={inputClasses}
            />
          </Field>
          <Field label="Phone">
            <input
              name="emergencyContactPhone"
              type="tel"
              defaultValue={dbUser.emergencyContactPhone ?? ""}
              className={inputClasses}
            />
          </Field>
          <Button type="submit" className="self-start">
            Save
          </Button>
        </form>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">Notification Preferences</h2>
        <form action={updateNotificationPreferences} className="mt-4 flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              name="notifyEmailUpdates"
              type="checkbox"
              defaultChecked={dbUser.notifyEmailUpdates}
              className="h-4 w-4 rounded border-venturo-olive/40 text-venturo-olive focus:ring-venturo-olive/30"
            />
            Email me about announcements and rent updates
          </label>
          <Button type="submit" className="self-start">
            Save
          </Button>
        </form>
      </Card>

      <Card className="mt-6 border-red-200">
        <h2 className="font-semibold text-foreground">Danger Zone</h2>
        {deleteError && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {deleteErrors[deleteError] ?? deleteError}
          </p>
        )}
        <p className="mt-3 text-sm text-foreground/60">
          Permanently delete your account. Your profile details are removed and you won&apos;t
          be able to log back in. This can&apos;t be undone.
        </p>
        <ConfirmForm
          action={deleteAccount}
          confirmMessage="Permanently delete your account? You won't be able to log back in. This cannot be undone."
          className="mt-4"
        >
          <Button type="submit" variant="danger">
            Delete Account
          </Button>
        </ConfirmForm>
      </Card>
    </Container>
  );
}
