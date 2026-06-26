import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { gmailCredential: true }
  });

  if (!user) redirect("/auth/signin");

  const isGmailConnected = !!user.gmailCredential;

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium text-[var(--color-espresso-ink)]">Settings</h1>
        <p className="text-sm text-[var(--color-muted-clay)]">Manage your integrations and app preferences</p>
      </header>

      <section className="flex flex-col gap-6">
        <div className="bg-[var(--color-card-stone)] p-6 rounded-xl border border-[var(--color-border-sand)] shadow-subtle max-w-2xl">
          <h2 className="text-xl font-medium text-[var(--color-espresso-ink)] mb-2">Auto-Import Integration</h2>
          <p className="text-sm text-[var(--color-muted-clay)] mb-6">
            Connect your Gmail account to automatically import receipts and transactions. We use read-only access and never store your emails.
          </p>

          {isGmailConnected ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[var(--color-signal-green)]" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--color-espresso-ink)]">Connected securely</span>
                  <span className="text-xs text-[var(--color-muted-clay)]">Syncing enabled</span>
                </div>
              </div>
              <form action="/api/auth/gmail/disconnect" method="POST">
                <Button variant="outline" type="submit" className="text-[var(--color-espresso-ink)] border-[var(--color-border-sand)]">
                  Disconnect Gmail
                </Button>
              </form>
            </div>
          ) : (
            <form action="/api/auth/gmail">
              <Button type="submit" className="bg-[var(--color-espresso-ink)] text-[var(--color-page-parchment)] rounded-full px-6">
                Connect Gmail
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
