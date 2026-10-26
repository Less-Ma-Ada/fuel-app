
import { createContext, useContext, useEffect, useState } from "react";

const DemoContext = createContext(null);

const initialData = {
  business: {
    name: "Lesedi Fresh Produce",
    sector: "Agriculture",
    location: "Soweto, Gauteng",
    description: "Fresh produce supplied to local households and small retailers.",
    registrationNumber: "",
    monthlyTarget: 15000,
  },

  transactions: [
    {
      id: "tx-1",
      type: "income",
      description: "Vegetable sales",
      amount: 2500,
      date: "2026-10-20",
    },
    {
      id: "tx-2",
      type: "expense",
      description: "Produce stock",
      amount: 900,
      date: "2026-10-21",
    },
  ],

  opportunities: [
    {
      id: "opp-1",
      name: "Township Business Growth Fund",
      provider: "Demo Funding Partner",
      amount: 25000,
      sector: "All sectors",
      description: "Simulated support for small-business growth.",
    },
    {
      id: "opp-2",
      name: "Youth Agriculture Starter Fund",
      provider: "Demo Youth Fund",
      amount: 15000,
      sector: "Agriculture",
      description: "Simulated funding for youth-led agricultural businesses.",
    },
  ],

  applications: [],
  leads: [],
  treasury: {
    contributions: [],
    proposals: [],
  },
  profile: {
    fullName: "Demo Entrepreneur",
    privacy: "private",
  },
};

function loadInitialData() {
  try {
    const saved = localStorage.getItem("fuel-business-demo");

    if (saved) {
      return {
        ...initialData,
        ...JSON.parse(saved),
      };
    }
  } catch (error) {
    console.error("Could not load demo data:", error);
  }

  return initialData;
}

export function DemoProvider({ children }) {
  const [data, setData] = useState(loadInitialData);

  useEffect(() => {
    try {
      localStorage.setItem("fuel-business-demo", JSON.stringify(data));
    } catch (error) {
      console.error("Could not save demo data:", error);
    }
  }, [data]);

  function updateBusiness(updates) {
    setData((current) => ({
      ...current,
      business: { ...current.business, ...updates },
    }));
  }

  function addTransaction(transaction) {
    setData((current) => ({
      ...current,
      transactions: [
        {
          ...transaction,
          id: crypto.randomUUID(),
          amount: Number(transaction.amount),
        },
        ...current.transactions,
      ],
    }));
  }

  function applyForFunding(opportunity) {
    setData((current) => {
      if (
        current.applications.some(
          (application) =>
            application.opportunityId === opportunity.id
        )
      ) {
        return current;
      }

      return {
        ...current,
        applications: [
          {
            id: crypto.randomUUID(),
            opportunityId: opportunity.id,
            opportunityName: opportunity.name,
            amount: opportunity.amount,
            status: "Submitted — demo",
            date: new Date().toISOString().slice(0, 10),
          },
          ...current.applications,
        ],
      };
    });
  }

  function resetDemo() {
    setData(initialData);
  }

  const income = data.transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount), 0);

  const expenses = data.transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount), 0);

  const value = {
    data,
    income,
    expenses,
    cashFlow: income - expenses,
    updateBusiness,
    addTransaction,
    applyForFunding,
    resetDemo,
    setData,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);

  if (!context) {
    throw new Error("useDemo must be used inside DemoProvider");
  }

  return context;
}
