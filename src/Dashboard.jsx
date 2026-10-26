
import { useDemo } from "./data/DemoContext";
import { R } from "./util";
import { Icon, Tag } from "./ui";

const TILES = [
  ["funding", "funding", "Funding opportunities", "Explore simulated funding"],
  ["books", "book", "Bookkeeping", "Log income and expenses"],
  ["market", "market", "Market and procurement", "Find customers and suppliers"],
  ["treasury", "treasury", "Community treasury", "Explore demo proposals"],
];

function greeting() {
  const h = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Africa/Johannesburg",
    }).format(new Date())
  );

  return h < 12
    ? "Good morning"
    : h < 18
    ? "Good afternoon"
    : "Good evening";
}

export default function Dashboard({ name, go }) {
  const {
    data,
    income,
    expenses,
    cashFlow,
    updateBusiness,
  } = useDemo();

  const biz = data.business;
  const transactions = data.transactions || [];

  const initials = (biz.name || "My Business")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const daysLogged = new Set(
    transactions.map((transaction) => transaction.date)
  ).size;

  const checks = [
    ["Add your business sector", !!biz.sector],
    ["Add your business location", !!biz.location],
    ["Record at least 3 transactions", transactions.length >= 3],
    ["Add a registration number", !!biz.registrationNumber],
  ];

  const completed = checks.filter(([, ok]) => ok).length;
  const readiness = Math.round((completed / checks.length) * 100);

  return (
    <section>
      <p className="fx-greet">
        {greeting()}, {(name || "Entrepreneur").split(" ")[0]}
      </p>

      <div className="fx-hero">
        <div className="fx-avatar">{initials}</div>

        <div className="grow">
          <h2>{biz.name || "My Business"}</h2>
          <p>
            {[biz.sector, biz.location].filter(Boolean).join(" · ") ||
              "Add your business details"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Tag tone="dark">
            {biz.registrationNumber ? "Registration details added" : "Registration details needed"}
          </Tag>
          <Tag tone="warn">Demo profile · Not verified</Tag>
        </div>
      </div>

      <div className="fx-metrics">
        <div className="fx-metric">
          <small>Total income</small>
          <b>{R(income)}</b>
        </div>

        <div className="fx-metric">
          <small>Total expenses</small>
          <b>{R(expenses)}</b>
        </div>

        <div className="fx-metric">
          <small>Net cash flow</small>
          <b className={cashFlow < 0 ? "neg" : "pos"}>
            {R(cashFlow)}
          </b>
        </div>

        <div className="fx-metric">
          <small>Days with records</small>
          <b>{daysLogged}</b>
        </div>
      </div>

      <h2>Business credibility</h2>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <b>Profile readiness</b>
            <p className="note">
              Based on the information you have entered.
            </p>
          </div>
          <b>{readiness}%</b>
        </div>

        <div
          style={{
            height: 8,
            background: "#DCE8E5",
            borderRadius: 99,
            overflow: "hidden",
            margin: "12px 0",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${readiness}%`,
              background: "#10B981",
              transition: "width 200ms ease",
            }}
          />
        </div>

        {checks.map(([label, ok]) => (
          <div className="fx-check" key={label}>
            <span className={ok ? "ok" : "todo"}>
              <Icon name={ok ? "check" : "circle"} />
            </span>
            <span style={{ flex: 1 }}>{label}</span>
            {!ok && (
              <button onClick={() => go("passport")}>Complete</button>
            )}
          </div>
        ))}

        <p className="note">
          This is a demo readiness indicator, not a credit score or funding
          decision. New businesses are not automatically considered
          untrustworthy.
        </p>
      </div>

      <h2>Go to</h2>

      <div className="fx-tiles">
        {TILES.map(([page, icon, title, sub]) => (
          <button
            key={page}
            className="fx-tile"
            onClick={() => go(page)}
          >
            <span className="fx-ico">
              <Icon name={icon} />
            </span>
            <span>
              <b>{title}</b>
              <small>{sub}</small>
            </span>
          </button>
        ))}
      </div>

      <h2>Recent activity</h2>

      {transactions.length === 0 ? (
        <div className="card">
          <p className="note">No transactions recorded yet.</p>
          <button className="primary" onClick={() => go("books")}>
            Record your first transaction
          </button>
        </div>
      ) : (
        transactions.slice(0, 5).map((transaction) => (
          <div className="card row2" key={transaction.id}>
            <div>
              <b>{transaction.description}</b>
              <p className="note">{transaction.date}</p>
            </div>

            <b className={transaction.type === "income" ? "pos" : "neg"}>
              {transaction.type === "income" ? "+" : "-"}
              {R(Number(transaction.amount))}
            </b>

            <Tag tone={transaction.type === "income" ? "dark" : "warn"}>
              {transaction.type}
            </Tag>
          </div>
        ))
      )}

      <div className="card">
        <b>Demo data</b>
        <p className="note">
          All sample transactions and funding opportunities are simulated.
          They do not represent real financial activity or guaranteed funding.
        </p>
        <button
          onClick={() =>
            updateBusiness({
              name: "Lesedi Fresh Produce",
              sector: "Agriculture",
              location: "Soweto, Gauteng",
            })
          }
        >
          Restore sample business details
        </button>
      </div>
    </section>
  );
}
