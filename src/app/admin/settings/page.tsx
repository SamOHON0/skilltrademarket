import {
  TIER_RELEASE_OFFSETS_MINUTES,
  UNLOCK_ALLOWANCES_MONTHLY,
  JOB_UNLOCK_CAP,
  JOB_EXPIRY_DAYS,
  ADMIN_ESCALATION_HOURS,
} from "@/lib/constants";

export const metadata = { title: "Platform settings | Skill Trade admin" };

export default function AdminSettingsPage() {
  const rows: [string, string][] = [
    [
      "Tier release offsets",
      `Elite ${TIER_RELEASE_OFFSETS_MINUTES.elite}m / Pro ${TIER_RELEASE_OFFSETS_MINUTES.pro}m / Basic ${TIER_RELEASE_OFFSETS_MINUTES.basic}m`,
    ],
    [
      "Monthly unlock allowances",
      `Basic ${UNLOCK_ALLOWANCES_MONTHLY.basic} / Pro ${UNLOCK_ALLOWANCES_MONTHLY.pro} / Elite ${UNLOCK_ALLOWANCES_MONTHLY.elite ?? "unlimited"}`,
    ],
    ["Job unlock cap", `${JOB_UNLOCK_CAP} trades per job`],
    ["Job expiry", `${JOB_EXPIRY_DAYS} days`],
    ["Admin escalation", `${ADMIN_ESCALATION_HOURS} hours`],
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform settings</h1>
      <p className="mt-1 text-sm text-ink/60">
        The tunable rules behind matching and access. Read-only for now; these
        live in code and the platform_settings table. An in-admin editor (change
        without a redeploy) is a later enhancement.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium">{label}</td>
                <td className="px-4 py-3 text-ink/70">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
