export default function DispatchScopePortalMockup() {
  const kpis = [
    { label: "Open Dispatches", value: "128", sub: "+14 this week" },
    { label: "Needs Scope", value: "23", sub: "7 urgent" },
    { label: "At Risk", value: "11", sub: "traffic/weather/BOM" },
    { label: "AI Drafted Today", value: "36", sub: "92% accepted" },
  ];

  const dispatches = [
    {
      caseNo: "CS0062107",
      client: "Vista Equity Partners",
      site: "Austin, TX – Floor 30 Kitchen",
      when: "Today · 2:30 PM",
      tech: "David Birdwell",
      status: "Needs Scope",
      risk: "Medium",
      weather: "Light Rain · 64°F",
      eta: "42 min",
    },
    {
      caseNo: "INC000062869178",
      client: "Bank of America",
      site: "Jacksonville, FL – Work Cafe",
      when: "Tomorrow · 9:00 AM",
      tech: "Unassigned",
      status: "Dispatch Review",
      risk: "High",
      weather: "Storm Risk · 71°F",
      eta: "1 hr 18 min",
    },
    {
      caseNo: "CS0064872",
      client: "Global Law Firm",
      site: "Stamford, CT – Conf A",
      when: "Thu · 8:00 AM",
      tech: "M. Rios + LP",
      status: "Ready",
      risk: "Low",
      weather: "Clear · 51°F",
      eta: "33 min",
    },
  ];

  const alerts = [
    "3 scopes likely out-of-scope against BOM and need review",
    "5 visits tomorrow have elevated traffic delay risk",
    "2 dispatches missing confirmed site contact details",
    "1 project has repeated return visits in the last 14 days",
  ];

  const aiQueue = [
    {
      title: "Draft Scope from Case + Prior Visits",
      desc: "Generate a polished scope using case notes, technician updates, and previous dispatch history.",
      action: "Run AI Draft",
    },
    {
      title: "Validate Scope vs Original BOM",
      desc: "Check whether requested work aligns with sold equipment and project intent.",
      action: "Run Validation",
    },
    {
      title: "Rewrite for Client-Friendly Tone",
      desc: "Create a cleaner client-facing scope while preserving the internal technical version.",
      action: "Rewrite Scope",
    },
  ];

  const bomChecks = [
    { project: "JPMC-4471", status: "Possibly Out of Scope", confidence: "81%", note: "Added display relocation not found in BOM" },
    { project: "BOFA-2290", status: "Aligned", confidence: "93%", note: "Signal-path troubleshooting aligns with original room support" },
    { project: "VEP-1038", status: "Needs Review", confidence: "68%", note: "DSP-related notes present, BOM reference incomplete" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 lg:flex">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">AV Operations</div>
            <div className="mt-2 text-2xl font-semibold">Dispatch IQ</div>
            <div className="mt-1 text-sm text-slate-400">Scope & Dispatch Intelligence Portal</div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-4 text-sm">
            {[
              "Dashboard",
              "Dispatch Board",
              "Cases",
              "Scope Builder",
              "Scope Review",
              "BOM Validation",
              "Projects",
              "Reports",
              "Admin",
            ].map((item, i) => (
              <div
                key={item}
                className={`rounded-2xl px-4 py-3 ${i === 0 ? "bg-violet-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-900"}`}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="m-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Automation Status</div>
            <div className="mt-3 text-sm text-slate-200">AI triggers active for:</div>
            <ul className="mt-2 space-y-2 text-sm text-slate-400">
              <li>• Needs Scope</li>
              <li>• Scope Save</li>
              <li>• BOM Comparison</li>
            </ul>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Dispatch Command Center</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Live scheduling, scope intelligence, BOM validation, and operational risk visibility.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="w-72 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  placeholder="Search case, client, site, tech, project..."
                  readOnly
                />
                <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm">New Scope</button>
                <button className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium text-white shadow-sm">AI Assist</button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="text-sm text-slate-500">{kpi.label}</div>
                  <div className="mt-3 text-4xl font-semibold tracking-tight">{kpi.value}</div>
                  <div className="mt-2 text-sm text-emerald-600">{kpi.sub}</div>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Dispatch Board</h2>
                    <p className="mt-1 text-sm text-slate-500">Priority cases with travel, weather, and scope-readiness context.</p>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5">Today</span>
                    <span className="rounded-full bg-violet-100 px-3 py-1.5 text-violet-700">Needs Scope</span>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-8 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <div>Case</div>
                    <div>Client</div>
                    <div className="col-span-2">Site / Date</div>
                    <div>Tech</div>
                    <div>Status</div>
                    <div>Risk</div>
                    <div>Travel</div>
                  </div>
                  {dispatches.map((row) => (
                    <div key={row.caseNo} className="grid grid-cols-8 items-center border-t border-slate-200 px-4 py-4 text-sm">
                      <div className="font-semibold text-slate-900">{row.caseNo}</div>
                      <div>{row.client}</div>
                      <div className="col-span-2">
                        <div className="font-medium">{row.site}</div>
                        <div className="mt-1 text-xs text-slate-500">{row.when}</div>
                      </div>
                      <div>{row.tech}</div>
                      <div>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">{row.status}</span>
                      </div>
                      <div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.risk === "High" ? "bg-rose-100 text-rose-700" : row.risk === "Medium" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>{row.risk}</span>
                      </div>
                      <div>
                        <div className="font-medium">{row.eta}</div>
                        <div className="mt-1 text-xs text-slate-500">{row.weather}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold">Operational Alerts</h2>
                  <div className="mt-4 space-y-3">
                    {alerts.map((a) => (
                      <div key={a} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        {a}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold">AI Action Queue</h2>
                  <div className="mt-4 space-y-3">
                    {aiQueue.map((item) => (
                      <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                        <div className="font-medium">{item.title}</div>
                        <div className="mt-1 text-sm text-slate-500">{item.desc}</div>
                        <button className="mt-3 rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white">{item.action}</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Scope Builder Preview</h2>
                    <p className="mt-1 text-sm text-slate-500">Split workflow for internal drafting and client-facing output.</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">AI Confidence 88%</div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold">Structured Inputs</div>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="rounded-xl bg-white p-3">Case number auto-filled from dispatch</div>
                      <div className="rounded-xl bg-white p-3">Client / site details pulled from data layer</div>
                      <div className="rounded-xl bg-white p-3">Special tools, staffing, access, and prior visit context</div>
                      <div className="rounded-xl bg-white p-3">Trigger AI draft from notes + previous visit summary</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Generated Scope</div>
                      <div className="flex gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2 py-1">Internal</span>
                        <span className="rounded-full bg-violet-100 px-2 py-1 text-violet-700">Client Facing</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                      <div>
                        <div className="font-semibold">Overview</div>
                        <div>Technician to evaluate display relocation issue, verify signal path behavior, and confirm system operation after corrective action.</div>
                      </div>
                      <div>
                        <div className="font-semibold">Staffing Plan</div>
                        <div>1 internal AV technician onsite. Escalate to engineering support if programming or DSP anomalies are discovered.</div>
                      </div>
                      <div>
                        <div className="font-semibold">Closeout Expectations</div>
                        <div>Capture findings, document any out-of-scope observations, and confirm final room status before departure.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">BOM / Scope Alignment</h2>
                    <p className="mt-1 text-sm text-slate-500">AI-assisted validation against sold scope and project references.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {bomChecks.map((item) => (
                    <div key={item.project} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{item.project}</div>
                          <div className="mt-1 text-sm text-slate-500">{item.note}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{item.status}</div>
                          <div className="mt-1 text-xs text-slate-500">Confidence {item.confidence}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
