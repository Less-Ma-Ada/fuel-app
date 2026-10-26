
import { useMemo, useState } from "react";
import { useDemo } from "./data/DemoContext";
import { R } from "./util";

export default function Funding({ go }) {
  const { data, applyForFunding } = useDemo();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All sectors");
  const [message, setMessage] = useState("");

  const sectors = [
    "All sectors",
    ...new Set(data.opportunities.map((item) => item.sector)),
  ];

  const opportunities = useMemo(() => {
    return data.opportunities.filter((item) => {
      const matchesSearch =
        `${item.name} ${item.provider} ${item.description}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesSector =
        sector === "All sectors" ||
        item.sector === "All sectors" ||
        item.sector === sector;

      return matchesSearch && matchesSector;
    });
  }, [data.opportunities, search, sector]);

  function handleApply(item) {
    const alreadyApplied = data.applications.some(
      (application) => application.opportunityId === item.id
    );

    if (alreadyApplied) {
      setMessage("You've already applied to this demo opportunity.");
      return;
    }

    applyForFunding(item);
    setMessage(`Demo application submitted for ${item.name}.`);
  }

  return (
    <section>
      <div className="card">
        <h2>Funding opportunities</h2>
        <p className="note">
          Explore sample funding programmes and practise preparing
          applications. These are simulated offers, not real funding.
        </p>

        <label htmlFor="funding-search">Search opportunities</label>
        <input
          id="funding-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by programme or provider"
        />

        <label htmlFor="funding-sector">Filter by sector</label>
        <select
          id="funding-sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        >
          {sectors.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div className="card" role="status">
          {message}
        </div>
      )}

      <h2>{opportunities.length} programmes found</h2>

      {opportunities.map((item) => {
        const applied = data.applications.some(
          (application) => application.opportunityId === item.id
        );

        return (
          <article className="card" key={item.id}>
            <div className="row2">
              <div>
                <h3>{item.name}</h3>
                <p className="note">{item.provider}</p>
              </div>
              <span className="tag">DEMO</span>
            </div>

            <h2>{R(item.amount)}</h2>
            <p>{item.description}</p>

            <p className="note">
              Sector: {item.sector}
            </p>

            <p className="note">
              Eligibility must be confirmed with a real programme
              provider. This sample does not represent an actual offer.
            </p>

            <button
              className="primary"
              disabled={applied}
              onClick={() => handleApply(item)}
            >
              {applied ? "Demo application submitted" : "Apply in demo"}
            </button>
          </article>
        );
      })}

      {opportunities.length === 0 && (
        <div className="card">
          <p>No matching programmes. Try another search or sector.</p>
        </div>
      )}

      <button onClick={() => go("apps")}>
        View my applications
      </button>
    </section>
  );
}
