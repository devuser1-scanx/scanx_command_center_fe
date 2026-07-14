// app/(dashboard)/admin/dashboard/page.tsx

const stats = [
  {
    label: "Today",
    value: "18",
    tone: "blue",
  },
  {
    label: "Confirmed",
    value: "11",
    tone: "green",
  },
  {
    label: "Checked-In",
    value: "4",
    tone: "green",
  },
  {
    label: "Late",
    value: "2",
    tone: "red",
  },
  {
    label: "Report Pending",
    value: "3",
    tone: "orange",
  },
];

const patients = [
  {
    name: "Robert Lee",
    exam: "Thyroid",
    time: "10:15",
    status: "In Scan",
    color: "#d97706",
    top: "8%",
    left: "25%",
  },
  {
    name: "Maria Garcia",
    exam: "Pelvic",
    time: "11:00",
    status: "Confirmed",
    color: "#2563eb",
    top: "30%",
    left: "34%",
  },
  {
    name: "Jane Smith",
    exam: "Abdominal",
    time: "09:00",
    status: "Waiting",
    color: "#16a34a",
    top: "48%",
    left: "19%",
  },
  {
    name: "Mark Evans",
    exam: "DVT",
    time: "10:00",
    status: "Late",
    color: "#dc2626",
    top: "62%",
    left: "23%",
  },
  {
    name: "Ava Brown",
    exam: "Carotid",
    time: "12:30",
    status: "Due Soon",
    color: "#7c3aed",
    top: "48%",
    left: "54%",
  },
];

const actionItems = [
  {
    label: "Late check-in",
    detail: "Mark Evans · 10:00 DVT",
    action: "Call",
    color: "#dc2626",
  },
  {
    label: "Report ready",
    detail: "David Kim · Echo",
    action: "Send",
    color: "#7c3aed",
  },
  {
    label: "Unpaid upcoming",
    detail: "Ava Brown · 12:30 Carotid",
    action: "Collect",
    color: "#d97706",
  },
  {
    label: "Missed call",
    detail: "Unknown +1 555...",
    action: "Callback",
    color: "#2563eb",
  },
];

const formStatuses = [
  {
    patient: "Jane Smith",
    appointment: "AC-10284",
    form: "PCP Form",
    status: "Completed",
    tone: "green",
    detail: "Received today at 09:12 AM",
  },
  {
    patient: "Maria Garcia",
    appointment: "AC-10302",
    form: "Transvaginal Consent",
    status: "Pending",
    tone: "orange",
    detail: "Sent · waiting for patient",
  },
  {
    patient: "Mark Evans",
    appointment: "AC-10260",
    form: "Scrotal Consent",
    status: "Missing",
    tone: "red",
    detail: "Not sent yet",
  },
  {
    patient: "Robert Lee",
    appointment: "AC-10291",
    form: "PCP Form",
    status: "Sent",
    tone: "blue",
    detail: "Opened · not submitted",
  },
];

function getBadgeClass(tone: string) {
  switch (tone) {
    case "green":
      return "bg-[#e6f7ed] text-[#16803c]";
    case "red":
      return "bg-[#ffeeee] text-[#cc3333]";
    case "orange":
      return "bg-[#fff2df] text-[#b45309]";
    case "blue":
    default:
      return "bg-[#eaf1ff] text-[#2563eb]";
  }
}

function getFormStatusClass(tone: string) {
  switch (tone) {
    case "green":
      return {
        dot: "bg-[#16803c]",
        badge: "bg-[#e6f7ed] text-[#16803c]",
        button: "bg-[#16803c]",
      };

    case "red":
      return {
        dot: "bg-[#cc3333]",
        badge: "bg-[#ffeeee] text-[#cc3333]",
        button: "bg-[#cc3333]",
      };

    case "orange":
      return {
        dot: "bg-[#d97706]",
        badge: "bg-[#fff2df] text-[#b45309]",
        button: "bg-[#d97706]",
      };

    case "blue":
    default:
      return {
        dot: "bg-[#2563eb]",
        badge: "bg-[#eaf1ff] text-[#2563eb]",
        button: "bg-[#2563eb]",
      };
  }
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#2d2d2d]">
              Dallas Clinic — Live Patient Movement Board
            </h2>

            <p className="mt-1 text-sm text-[#777777]">
              Patient pin cards move with time and update from check-in, call, payment, report and status events.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.map((item) => (
              <span
                key={item.label}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${getBadgeClass(item.tone)}`}
              >
                {item.value} {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#2d2d2d]">
              Timeline by appointment
            </h3>

            <p className="text-sm text-[#777777]">
              Auto updates by webhook / websocket
            </p>
          </div>

          <span className="rounded-full bg-[#fff2df] px-3 py-1.5 text-xs font-bold text-[#b45309]">
            Now 10:42 AM
          </span>
        </div>

        <div className="relative h-[430px] overflow-hidden rounded-xl border border-[#e4ddd0] bg-[#fbfaf7]">
          <div className="absolute left-0 top-0 grid h-full w-full grid-cols-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="border-l border-[#e9e1d5]"
              />
            ))}
          </div>

          <div className="absolute left-4 top-6 space-y-4">
            {[
              "Room 1",
              "Room 2",
              "Waiting",
              "Reports",
            ].map((room) => (
              <div
                key={room}
                className="flex h-[72px] w-[74px] items-center justify-center rounded-xl border border-[#e4ddd0] bg-white text-center text-xs font-semibold text-[#777777]"
              >
                {room}
              </div>
            ))}
          </div>

          {patients.map((patient) => (
            <div
              key={patient.name}
              className="absolute w-[230px] rounded-xl border border-[#d9d1c4] bg-white shadow-md"
              style={{
                top: patient.top,
                left: patient.left,
              }}
            >
              <div
                className="h-2 rounded-t-xl"
                style={{
                  backgroundColor: patient.color,
                }}
              />

              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-[#2d2d2d]">
                    {patient.name}
                  </h4>

                  <span className="rounded-full bg-[#f5f1e8] px-2 py-1 text-[10px] font-bold uppercase text-[#8b6f47]">
                    {patient.status}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#777777]">
                  <p>
                    <span className="font-semibold text-[#2d2d2d]">
                      Exam:
                    </span>{" "}
                    {patient.exam}
                  </p>

                  <p>
                    <span className="font-semibold text-[#2d2d2d]">
                      Time:
                    </span>{" "}
                    {patient.time}
                  </p>
                </div>

                <div className="mt-3 flex gap-1.5">
                  <button className="rounded bg-[#2563eb] px-3 py-1.5 text-xs font-semibold text-white">
                    Call
                  </button>

                  <button className="rounded bg-[#16a34a] px-3 py-1.5 text-xs font-semibold text-white">
                    Text
                  </button>

                  <button className="rounded bg-[#8b6f47] px-3 py-1.5 text-xs font-semibold text-white">
                    Report
                  </button>

                  <button className="rounded bg-[#2d2d2d] px-3 py-1.5 text-xs font-semibold text-white">
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr_1fr]">
        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">
            Selected Patient Detail Card
          </h3>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h4 className="text-2xl font-bold text-[#2d2d2d]">
                Jane Smith
              </h4>

              <span className="rounded-full bg-[#e6f7ed] px-2.5 py-1 text-xs font-bold text-[#16803c]">
                WAITING
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
              {[
                ["Phone", "+1 (555) 222-0198"],
                ["Clinic", "Dallas"],
                ["Exam", "Abdominal Ultrasound"],
                ["Appointment ID", "AC-10284"],
                ["Payment", "Paid $124"],
                ["Report", "Pending"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-semibold uppercase text-[#999999]">
                    {label}
                  </p>
                  <p className="mt-1 font-bold text-[#2d2d2d]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white">
                Call
              </button>
              <button className="rounded-md bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white">
                Text
              </button>
              <button className="rounded-md bg-[#8b6f47] px-4 py-2 text-sm font-semibold text-white">
                Send Report
              </button>
              <button className="rounded-md bg-[#d97706] px-4 py-2 text-sm font-semibold text-white">
                Create Case
              </button>
              <button className="rounded-md bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white">
                Open Profile
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">
            Real-Time Action Queue
          </h3>

          <div className="mt-4 space-y-3">
            {actionItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-[#e4ddd0] bg-[#fbfaf7] p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="size-3 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <div>
                    <p className="text-sm font-bold text-[#2d2d2d]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[#777777]">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <button
                  className="rounded-md px-3 py-1.5 text-xs font-bold text-white"
                  style={{
                    backgroundColor: item.color,
                  }}
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
  <div className="flex items-start justify-between gap-4">
    <div>
      <h3 className="text-lg font-bold text-[#2d2d2d]">
        Form Status
      </h3>

      <p className="mt-1 text-sm text-[#777777]">
        Track PCP, Transvaginal consent, Scrotal consent and other required patient forms.
      </p>
    </div>

    <span className="rounded-full bg-[#fff2df] px-3 py-1.5 text-xs font-bold text-[#b45309]">
      2 Pending
    </span>
  </div>

  <div className="mt-5 space-y-3">
    {formStatuses.map((item) => {
      const classes = getFormStatusClass(item.tone);

      return (
        <div
          key={`${item.appointment}-${item.form}`}
          className="rounded-xl border border-[#e4ddd0] bg-[#fbfaf7] p-4"
        >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${classes.dot}`}
                  />

                  <p className="truncate text-sm font-bold text-[#2d2d2d]">
                    {item.patient}
                  </p>
                </div>

                <p className="mt-1 text-xs text-[#777777]">
                  {item.form} · {item.appointment}
                </p>

                <p className="mt-1 text-xs text-[#999999]">
                  {item.detail}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${classes.badge}`}
              >
                {item.status}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-xs font-bold text-white ${classes.button}`}
              >
                {item.status === "Completed"
                  ? "View"
                  : item.status === "Missing"
                    ? "Send"
                    : "Remind"}
              </button>

              <button
                type="button"
                className="rounded-md bg-[#2d2d2d] px-3 py-1.5 text-xs font-bold text-white"
              >
                Open
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
      </section>
    </div>
  );
}