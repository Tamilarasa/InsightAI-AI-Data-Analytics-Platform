import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/layout";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie, Line, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function Charts() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fileId = localStorage.getItem("file_id");

    if (!fileId) return;

    API.get(`accounts/chart/${fileId}/`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log("CHART ERROR:", err.response?.data);
      });
  }, []);

  if (!data) {
    return (
      <Layout>
        <h2 style={{ color: "#fff" }}>Loading advanced analytics...</h2>
      </Layout>
    );
  }

  const colors = [
    "#38bdf8",
    "#818cf8",
    "#f472b6",
    "#facc15",
    "#34d399",
    "#fb923c",
    "#fb7185",
    "#a78bfa",
  ];

  const salaryByDepartment = {
    labels: data.salary_by_department?.labels || [],
    datasets: [
      {
        label: "Average Salary",
        data: data.salary_by_department?.values || [],
        backgroundColor: "#38bdf8",
        borderRadius: 8,
      },
    ],
  };

  const performanceByDepartment = {
    labels: data.performance_by_department?.labels || [],
    datasets: [
      {
        label: "Average Performance",
        data: data.performance_by_department?.values || [],
        backgroundColor: "#34d399",
        borderRadius: 8,
      },
    ],
  };

  const departmentDistribution = {
    labels: data.department_distribution?.labels || [],
    datasets: [
      {
        label: "Employees",
        data: data.department_distribution?.values || [],
        backgroundColor: colors,
        borderColor: "#0f172a",
        borderWidth: 3,
      },
    ],
  };

  const salaryDistribution = {
    labels: data.salary_distribution?.labels || [],
    datasets: [
      {
        label: "Employee Count",
        data: data.salary_distribution?.values || [],
        backgroundColor: "#818cf8",
        borderRadius: 8,
      },
    ],
  };

  const performanceTrend = {
    labels: data.performance_trend?.labels || [],
    datasets: [
      {
        label: "Performance",
        data: data.performance_trend?.values || [],
        borderColor: "#34d399",
        backgroundColor: "rgba(52,211,153,0.15)",
        pointBackgroundColor: "#34d399",
        pointBorderColor: "#ffffff",
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const salaryVsPerformance = {
    datasets: [
      {
        label: "Salary vs Performance",
        data: data.salary_vs_performance?.values || [],
        backgroundColor: "#f472b6",
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e5e7eb",
          font: {
            size: 13,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "#020617",
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.06)",
        },
      },
      y: {
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.08)",
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#e5e7eb",
          padding: 16,
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "#020617",
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
      },
    },
  };

  const scatterOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: "Salary",
          color: "#ffffff",
        },
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.08)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Performance",
          color: "#ffffff",
        },
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.08)",
        },
      },
    },
  };

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📊 Advanced Data Analyst Dashboard</h1>
            <p style={styles.subtitle}>
              Deep calculations and business analytics generated from your dataset.
            </p>
          </div>

          <div style={styles.fileBadge}>
            File: {data.filename}
          </div>
        </div>

        <div style={styles.kpiGrid}>
          <Kpi title="Rows" value={data.kpis?.rows} />
          <Kpi title="Columns" value={data.kpis?.columns} />
          <Kpi title="Missing Values" value={data.kpis?.missing_values} />
          <Kpi title="Average Salary" value={`₹${data.kpis?.avg_salary}`} />
          <Kpi title="Max Salary" value={`₹${data.kpis?.max_salary}`} />
          <Kpi title="Min Salary" value={`₹${data.kpis?.min_salary}`} />
          <Kpi title="Avg Performance" value={data.kpis?.avg_performance} />
          <Kpi title="Avg Experience" value={data.kpis?.avg_experience} />
        </div>

        <div style={styles.grid}>
          <ChartCard
            title="💰 Average Salary by Department"
            desc="Shows which departments have the highest average salary."
          >
            <Bar data={salaryByDepartment} options={commonOptions} />
          </ChartCard>

          <ChartCard
            title="🏆 Average Performance by Department"
            desc="Compares department-level employee performance."
          >
            <Bar data={performanceByDepartment} options={commonOptions} />
          </ChartCard>

          <ChartCard
            title="🥧 Department Distribution"
            desc="Shows employee count distribution across departments."
          >
            <Pie data={departmentDistribution} options={pieOptions} />
          </ChartCard>

          <ChartCard
            title="📦 Salary Distribution"
            desc="Shows salary ranges and employee count in each range."
          >
            <Bar data={salaryDistribution} options={commonOptions} />
          </ChartCard>

          <FullChartCard
            title="📉 Performance Trend"
            desc="Shows performance movement across the first 30 employee records."
          >
            <Line data={performanceTrend} options={commonOptions} />
          </FullChartCard>

          <FullChartCard
            title="🔍 Salary vs Performance"
            desc="Scatter chart to understand relationship between salary and performance."
          >
            <Scatter data={salaryVsPerformance} options={scatterOptions} />
          </FullChartCard>
        </div>
      </div>
    </Layout>
  );
}

function Kpi({ title, value }) {
  return (
    <div style={styles.kpiCard}>
      <span style={styles.kpiLabel}>{title}</span>
      <strong style={styles.kpiValue}>{value}</strong>
    </div>
  );
}

function ChartCard({ title, desc, children }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.chartTitle}>{title}</h2>
      <p style={styles.chartDesc}>{desc}</p>
      <div style={styles.chartBox}>{children}</div>
    </div>
  );
}

function FullChartCard({ title, desc, children }) {
  return (
    <div style={styles.fullCard}>
      <h2 style={styles.chartTitle}>{title}</h2>
      <p style={styles.chartDesc}>{desc}</p>
      <div style={styles.lineBox}>{children}</div>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px",
    color: "#ffffff",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
  },

  title: {
    fontSize: "34px",
    margin: 0,
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: "8px",
    fontSize: "15px",
  },

  fileBadge: {
    background: "rgba(37,99,235,0.18)",
    border: "1px solid rgba(96,165,250,0.35)",
    color: "#bfdbfe",
    padding: "12px 16px",
    borderRadius: "14px",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  kpiCard: {
    background:
      "linear-gradient(135deg, rgba(37,99,235,0.35), rgba(99,102,241,0.22))",
    padding: "22px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
  },

  kpiLabel: {
    color: "#cbd5e1",
    fontSize: "14px",
  },

  kpiValue: {
    display: "block",
    fontSize: "26px",
    marginTop: "10px",
    color: "#ffffff",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "24px",
  },

  card: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
  },

  fullCard: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
    gridColumn: "1 / -1",
  },

  chartTitle: {
    fontSize: "21px",
    margin: 0,
  },

  chartDesc: {
    color: "#94a3b8",
    fontSize: "14px",
    marginTop: "8px",
    lineHeight: "1.5",
  },

  chartBox: {
    height: "340px",
    marginTop: "18px",
  },

  lineBox: {
    height: "380px",
    marginTop: "18px",
  },
};