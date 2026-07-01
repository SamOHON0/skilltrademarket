import { getDataStore } from "@/lib/data";

export const metadata = { title: "Lead reports | Skill Trade admin" };

export default async function AdminReportsPage() {
  const reports = await getDataStore().getLeadReports();

  return (
    <div>
      <h1 className="text-2xl font-bold">Lead reports</h1>
      <p className="mt-1 text-sm text-ink/60">
        Trades flagging jobs they unlocked as dead or bad leads. Use these for
        refunds and to spot problem customers.
      </p>
      {reports.length === 0 ? (
        <p className="mt-6 text-sm text-ink/50">No reports yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="text-left text-ink/50">
              <tr className="border-b border-ink/10">
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-medium">{r.jobTitle}</td>
                  <td className="px-4 py-3">{r.tradeName}</td>
                  <td className="px-4 py-3">{r.reason}</td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3">
                    {new Date(r.createdAt).toLocaleDateString("en-IE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
