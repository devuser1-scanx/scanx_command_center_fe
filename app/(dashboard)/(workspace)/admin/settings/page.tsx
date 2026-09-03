// app/(dashboard)/admin/settings/page.tsx

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#2d2d2d]">
          Settings
        </h2>

        <p className="mt-2 text-sm text-[#777777]">
          Manage Command Center preferences, notification rules, clinic defaults and system configuration.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">
            General Settings
          </h3>

          <p className="mt-2 text-sm text-[#777777]">
            Default timezone, clinic behaviour and dashboard preferences will be configured here.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">
            Notification Settings
          </h3>

          <p className="mt-2 text-sm text-[#777777]">
            Configure missed-call alerts, report reminders, task alerts and escalation rules.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">
            Security Settings
          </h3>

          <p className="mt-2 text-sm text-[#777777]">
            Password policy, session expiry and access rules will be managed here.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">
            Integration Settings
          </h3>

          <p className="mt-2 text-sm text-[#777777]">
            Twilio, Acuity, n8n and report delivery integration status will be shown here.
          </p>
        </div>
      </section>
    </div>
  );
}