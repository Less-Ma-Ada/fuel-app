
import { useEffect, useState } from "react";
import { useDemo } from "./data/DemoContext";
import { R, todaySA, normalizeWa } from "./util";

const SECTORS = [
  "Retail",
  "Food and catering",
  "Agriculture",
  "Manufacturing",
  "Services",
  "Construction",
  "Technology",
  "Other",
];

const EMPTY = { revenue: "", expenses: "", note: "", off: false };

export default function Entrepreneur() {
  const {
    data,
    income,
    expenses,
    cashFlow,
    addTransaction,
    updateBusiness,
    setData,
  } = useDemo();

  const biz = data.business;
  const recs = data.transactions || [];
  const today = todaySA();

  const [day, setDay] = useState(today);
  const [log, setLog] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [pmsg, setPmsg] = useState("");

  const [prof, setProf] = useState({
    sector: biz.sector || "",
    area: biz.location || "",
    description: biz.description || "",
    whatsapp: biz.whatsapp || "",
    show_to_customers: Boolean(biz.show_to_customers),
    show_to_funders: Boolean(biz.show_to_funders),
  });

  useEffect(() => {
    const records = recs.filter((r) => r.date === day);
    const dayIncome = records
      .filter((r) => r.type === "income")
      .reduce((total, r) => total + Number(r.amount), 0);
    const dayExpenses = records
      .filter((r) => r.type === "expense")
      .reduce((total, r) => total + Number(r.amount), 0);

    setLog(
      records.length
        ? {
            revenue: String(dayIncome),
            expenses: String(dayExpenses),
            note: records[0].note || "",
            off: records.some((r) => r.type === "day-off"),
          }
        : EMPTY
    );
    setMsg("");
  }, [day]); // The selected date determines which entries are edited.

  function saveLog(e) {
    e.preventDefault();
    setMsg("");

    const revenue = log.off ? 0 : Number(log.revenue || 0);
    const spend = log.off ? 0 : Number(log.expenses || 0);

    if (day > today) {
      setMsg("Choose today or an earlier date.");
      return;
    }

    if (
      !log.off &&
      log.revenue.trim() === "" &&
      log.expenses.trim() === ""
    ) {
      setMsg("Enter income or expenses, or select Day Off.");
      return;
    }

    if (
      !Number.isFinite(revenue) ||
      !Number.isFinite(spend) ||
      revenue < 0 ||
      spend < 0
    ) {
      setMsg("Enter valid amounts. Amounts cannot be negative.");
      return;
    }

    // Replace previous demo entries for this date.
    setData((current) => ({
      ...current,
      transactions: current.transactions.filter(
        (r) => r.date !== day
      ),
    }));

    if (log.off) {
      setData((current) => ({
        ...current,
        transactions: [
          {
            id: crypto.randomUUID(),
            type: "day-off",
            description: "Business closed",
            amount: 0,
            date: day,
            note: log.note.trim().slice(0, 200),
          },
          ...current.transactions,
        ],
      }));
    } else {
      const newEntries = [];

      if (revenue > 0) {
        newEntries.push({
          id: crypto.randomUUID(),
          type: "income",
          description: "Daily income",
          amount: revenue,
          date: day,
          note: log.note.trim().slice(0, 200),
        });
      }

      if (spend > 0) {
        newEntries.push({
          id: crypto.randomUUID(),
          type: "expense",
          description: "Daily expenses",
          amount: spend,
          date: day,
          note: log.note.trim().slice(0, 200),
        });
      }

      setData((current) => ({
        ...current,
        transactions: [
          ...newEntries,
          ...current.transactions,
        ],
      }));
    }

    setMsg("Saved to local demo data.");
  }

  function saveProfile(e) {
    e.preventDefault();
    setPmsg("");

    const wa = normalizeWa(prof.whatsapp || "");

    if (wa === null) {
      setPmsg("Enter a valid South African number, like 0712345678.");
      return;
    }

    if (
      (prof.show_to_customers || prof.show_to_funders) &&
      !prof.area.trim()
    ) {
      setPmsg("Add your area before enabling visibility.");
      return;
    }

    if (prof.show_to_customers && !wa) {
      setPmsg("Add a WhatsApp number before showing your business to customers.");
      return;
    }

    updateBusiness({
      sector: prof.sector,
      location: prof.area.trim(),
      description: prof.description.trim().slice(0, 300),
      whatsapp: wa || "",
      show_to_customers: prof.show_to_customers,
      show_to_funders: prof.show_to_funders,
    });

    setPmsg("Demo profile saved.");
  }

  const daysLogged = new Set(recs.map((r) => r.date)).size;
  const profileChecks = [
    Boolean(biz.name),
    Boolean(biz.sector),
    Boolean(biz.location),
    Boolean(biz.description),
  ].filter(Boolean).length;

  const readiness = Math.round((profileChecks / 4) * 100);

  return (
    <section>
      <h2>{biz.name}</h2>
      <p className="note">
        {biz.location || "Add your area"} · Local demo workspace
      </p>

      <div className="stats">
        <div className="stat">
          <small>Profile readiness</small>
          <b>{readiness}%</b>
        </div>
        <div className="stat">
          <small>Days with records</small>
          <b>{daysLogged}</b>
        </div>
        <div className="stat">
          <small>Transactions</small>
          <b>{recs.length}</b>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <small>Total income</small>
          <b>{R(income)}</b>
        </div>
        <div className="stat">
          <small>Total expenses</small>
          <b>{R(expenses)}</b>
        </div>
        <div className="stat">
          <small>Net cash flow</small>
          <b className={cashFlow < 0 ? "neg" : "pos"}>
            {R(cashFlow)}
          </b>
        </div>
      </div>

      <h2>Bookkeeping · Log your day</h2>

      <form className="card" onSubmit={saveLog}>
        <label htmlFor="demo-date">Transaction date</label>
        <input
          id="demo-date"
          type="date"
          value={day}
          max={today}
          onChange={(e) => setDay(e.target.value || today)}
        />

        <label>
          <input
            type="checkbox"
            checked={log.off}
            onChange={(e) =>
              setLog({ ...log, off: e.target.checked })
            }
          />
          Day Off — business closed
        </label>

        {!log.off && (
          <>
            <label htmlFor="demo-income">Income (R)</label>
            <input
              id="demo-income"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1200"
              value={log.revenue}
              onChange={(e) =>
                setLog({ ...log, revenue: e.target.value })
              }
            />

            <label htmlFor="demo-expenses">Expenses (R)</label>
            <input
              id="demo-expenses"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 350"
              value={log.expenses}
              onChange={(e) =>
                setLog({ ...log, expenses: e.target.value })
              }
            />
          </>
        )}

        <label htmlFor="demo-note">Note</label>
        <input
          id="demo-note"
          maxLength={200}
          placeholder="Optional transaction note"
          value={log.note}
          onChange={(e) =>
            setLog({ ...log, note: e.target.value })
          }
        />

        {msg && (
          <p className={msg.startsWith("Saved") ? "note" : "err"}>
            {msg}
          </p>
        )}

        <button className="primary" type="submit">
          Save demo entries
        </button>
      </form>

      <h2>Recent records</h2>

      {recs.length === 0 && (
        <div className="card">
          <p className="note">No records yet. Add your first entry above.</p>
        </div>
      )}

      {recs
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10)
        .map((r) => (
          <div className="card row2" key={r.id}>
            <div>
              <b>{r.description}</b>
              <p className="note">
                {r.date}
                {r.note ? ` · ${r.note}` : ""}
              </p>
            </div>
            <b className={r.type === "income" ? "pos" : "neg"}>
              {r.type === "day-off"
                ? "Day Off"
                : `${r.type === "income" ? "+" : "−"}${R(Number(r.amount))}`}
            </b>
          </div>
        ))}

      <h2>Business Passport details</h2>

      <form className="card" onSubmit={saveProfile}>
        <label htmlFor="demo-sector">Business sector</label>
        <select
          id="demo-sector"
          value={prof.sector}
          onChange={(e) =>
            setProf({ ...prof, sector: e.target.value })
          }
        >
          <option value="">Choose sector</option>
          {SECTORS.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>

        <label htmlFor="demo-area">Area or township</label>
        <input
          id="demo-area"
          placeholder="e.g. Soweto, Gauteng"
          value={prof.area}
          onChange={(e) =>
            setProf({ ...prof, area: e.target.value })
          }
        />

        <label htmlFor="demo-description">What does your business do?</label>
        <textarea
          id="demo-description"
          maxLength={300}
          placeholder="Describe your products or services"
          value={prof.description}
          onChange={(e) =>
            setProf({ ...prof, description: e.target.value })
          }
        />

        <label htmlFor="demo-whatsapp">WhatsApp number</label>
        <input
          id="demo-whatsapp"
          placeholder="0712345678"
          value={prof.whatsapp}
          onChange={(e) =>
            setProf({ ...prof, whatsapp: e.target.value })
          }
        />

        <label>
          <input
            type="checkbox"
            checked={prof.show_to_customers}
            onChange={(e) =>
              setProf({
                ...prof,
                show_to_customers: e.target.checked,
              })
            }
          />
          Show business to customers (demo)
        </label>

        <label>
          <input
            type="checkbox"
            checked={prof.show_to_funders}
            onChange={(e) =>
              setProf({
                ...prof,
                show_to_funders: e.target.checked,
              })
            }
          />
          Show business to funders (demo)
        </label>

        <p className="note">
          These are local demo visibility settings. They do not publish
          your information online.
        </p>

        {pmsg && (
          <p className={pmsg.startsWith("Demo profile saved") ? "note" : "err"}>
            {pmsg}
          </p>
        )}

        <button className="primary" type="submit">
          Save business profile
        </button>
      </form>
    </section>
  );
}
