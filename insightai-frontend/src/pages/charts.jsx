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
  Filler,
} from "chart.js";

import { Bar, Doughnut, Line, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function Charts() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fileId = localStorage.getItem("file_id");

    if (!fileId) {
      setError("Please upload a dataset first.");
      return;
    }

    API.get(`accounts/chart/${fileId}/`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log("CHART ERROR:", err.response?.data);
        setError("Unable to load dashboard analytics.");
      });
  }, []);

  const fadedColors = [
    "rgba(96,165,250,0.70)",
    "rgba(129,140,248,0.70)",
    "rgba(52,211,153,0.70)",
    "rgba(251,146,60,0.70)",
    "rgba(244,114,182,0.70)",
    "rgba(250,204,21,0.70)",
    "rgba(45,212,191,0.70)",
    "rgba(167,139,250,0.70)",
  ];

  const borderColors = [
    "rgba(96,165,250,1)",
    "rgba(129,140,248,1)",
    "rgba(52,211,153,1)",
    "rgba(251,146,60,1)",
    "rgba(244,114,182,1)",
    "rgba(250,204,21,1)",
    "rgba(45,212,191,1)",
    "rgba(167,139,250,1)",
  ];

  const money = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const number = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return Number(value).toLocaleString("en-IN");
  };

  const chart = (key) => {
    return data?.[key] || { labels: [], values: [] };
  };

  const makeBarData = (key, label, color = fadedColors[0]) => ({
    labels: chart(key).labels,
    datasets: [
      {
        label,
        data: chart(key).values,
        backgroundColor: color,
        borderColor: color.replace("0.70", "1"),
        borderWidth: 1,
        borderRadius: 12,
        barThickness: 34,
      },
    ],
  });

  const makeDoughnutData = (key, label) => ({
    labels: chart(key).labels,
    datasets: [
      {
        label,
        data: chart(key).values,
        backgroundColor: fadedColors,
        borderColor: "rgba(15,23,42,1)",
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  });

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#dbeafe",
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(2,6,23,0.95)",
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(148,163,184,0.25)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#cbd5e1",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(148,163,184,0.10)",
        },
      },
      y: {
        ticks: {
          color: "#cbd5e1",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(148,163,184,0.12)",
        },
      },
    },
  };

  const horizontalOptions = {
    ...commonOptions,
    indexAxis: "y",
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "64%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#dbeafe",
          padding: 16,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(2,6,23,0.95)",
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        padding: 12,
        cornerRadius: 12,
      },
    },
  };

  const trendData = {
    labels: chart("performance_trend").labels,
    datasets: [
      {
        label: "Performance Trend",
        data: chart("performance_trend").values,
        borderColor: "rgba(52,211,153,1)",
        backgroundColor: "rgba(52,211,153,0.12)",
        pointBackgroundColor: "rgba(52,211,153,1)",
        pointBorderColor: "#ffffff",
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const scatterData = {
    datasets: [
      {
        label: "Salary vs Performance",
        data: data?.salary_vs_performance?.values || [],
        backgroundColor: "rgba(244,114,182,0.70)",
        borderColor: "rgba(244,114,182,1)",
        pointRadius: 5,
      },
    ],
  };

  const scatterOptions = {
    ...commonOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: "Salary",
          color: "#e5e7eb",
        },
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(148,163,184,0.10)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Performance",
          color: "#e5e7eb",
        },
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(148,163,184,0.12)",
        },
      },
    },
  };

  if (error) {
    return (
      <Layout>
        <div style={styles.page}>
          <div style={styles.errorBox}>{error}</div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div style={styles.page}>
          <h2 style={{ color: "#ffffff" }}>Loading business dashboard...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <p style={styles.smallTitle}>Business Intelligence Dashboard</p>
            <h1 style={styles.title}>📊 Professional Data Analyst Dashboard</h1>
            <p style={styles.subtitle}>
              Clear business calculations, employee performance insights, salary analytics,
              and department-level decision support.
            </p>
          </div>

          <div style={styles.fileBadge}>
            <span style={styles.fileLabel}>Dataset</span>
            <strong>{data.filename}</strong>
          </div>
        </div>

        <div style={styles.kpiGrid}>
          <Kpi icon="📁" title="Rows" value={number(data.kpis?.rows)} />
          <Kpi icon="🧩" title="Columns" value={number(data.kpis?.columns)} />
          <Kpi icon="⚠️" title="Missing Values" value={number(data.kpis?.missing_values)} />
          <Kpi icon="💰" title="Average Salary" value={money(data.kpis?.avg_salary)} />
          <Kpi icon="📍" title="Median Salary" value={money(data.kpis?.median_salary)} />
          <Kpi icon="🏆" title="Avg Performance" value={number(data.kpis?.avg_performance)} />
          <Kpi icon="🧠" title="Avg Experience" value={number(data.kpis?.avg_experience)} />
          <Kpi icon="⭐" title="High Performers" value={number(data.kpis?.high_performers)} />
          <Kpi icon="📉" title="Low Performers" value={number(data.kpis?.low_performers)} />
          <Kpi icon="🔗" title="Salary Corr." value={number(data.kpis?.salary_performance_corr)} />
        </div>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>💡 Business Insights</h2>
            <p style={styles.sectionDesc}>
              Automatic observations you can explain as a data analyst.
            </p>
          </div>

          <div style={styles.insightGrid}>
            {(data.business_insights || []).map((item, index) => (
              <div key={index} style={styles.insightCard}>
                <span style={styles.insightNumber}>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🏢 Department Analysis</h2>
            <p style={styles.sectionDesc}>
              Understand department performance, salary cost, and workforce distribution.
            </p>
          </div>

          <div style={styles.grid}>
            <ChartCard
              title="Average Performance by Department"
              desc="Shows which department is performing best."
            >
              <Bar
                data={makeBarData(
                  "performance_by_department",
                  "Average Performance",
                  "rgba(52,211,153,0.70)"
                )}
                options={horizontalOptions}
              />
            </ChartCard>

            <ChartCard
              title="Average Salary by Department"
              desc="Compares department-level salary cost."
            >
              <Bar
                data={makeBarData(
                  "salary_by_department",
                  "Average Salary",
                  "rgba(96,165,250,0.70)"
                )}
                options={horizontalOptions}
              />
            </ChartCard>

            <ChartCard
              title="Department Distribution"
              desc="Shows employee count across departments."
            >
              <Doughnut
                data={makeDoughnutData("department_distribution", "Employees")}
                options={doughnutOptions}
              />
            </ChartCard>

            <ChartCard
              title="Compensation Efficiency"
              desc="Performance generated per salary cost. Higher is better."
            >
              <Bar
                data={makeBarData(
                  "compensation_efficiency",
                  "Efficiency Score",
                  "rgba(167,139,250,0.70)"
                )}
                options={horizontalOptions}
              />
            </ChartCard>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>👥 Workforce Analysis</h2>
            <p style={styles.sectionDesc}>
              Analyze people performance by city, age, experience, and salary range.
            </p>
          </div>

          <div style={styles.grid}>
            <ChartCard
              title="Top Cities by Performance"
              desc="Find the locations producing stronger performance."
            >
              <Bar
                data={makeBarData(
                  "city_performance",
                  "Average Performance",
                  "rgba(45,212,191,0.70)"
                )}
                options={horizontalOptions}
              />
            </ChartCard>

            <ChartCard
              title="City Employee Distribution"
              desc="Shows where employees are located."
            >
              <Doughnut
                data={makeDoughnutData("city_distribution", "Employees")}
                options={doughnutOptions}
              />
            </ChartCard>

            <ChartCard
              title="Experience vs Performance"
              desc="Shows whether experience improves performance."
            >
              <Bar
                data={makeBarData(
                  "experience_performance",
                  "Average Performance",
                  "rgba(251,146,60,0.70)"
                )}
                options={commonOptions}
              />
            </ChartCard>

            <ChartCard
              title="Age Group vs Performance"
              desc="Compares performance across age bands."
            >
              <Bar
                data={makeBarData(
                  "age_performance",
                  "Average Performance",
                  "rgba(244,114,182,0.70)"
                )}
                options={commonOptions}
              />
            </ChartCard>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>💰 Salary and Performance Analysis</h2>
            <p style={styles.sectionDesc}>
              Useful for HR analytics, compensation planning, and productivity review.
            </p>
          </div>

          <div style={styles.grid}>
            <ChartCard
              title="Salary Distribution"
              desc="Shows how salaries are spread across employees."
            >
              <Bar
                data={makeBarData(
                  "salary_distribution",
                  "Employee Count",
                  "rgba(129,140,248,0.70)"
                )}
                options={commonOptions}
              />
            </ChartCard>

            <ChartCard
              title="Performance Distribution"
              desc="Shows low, average, good, and excellent performers."
            >
              <Doughnut
                data={makeDoughnutData("performance_distribution", "Employees")}
                options={doughnutOptions}
              />
            </ChartCard>

            <FullChartCard
              title="Performance Trend"
              desc="Performance movement across employee records."
            >
              <Line data={trendData} options={commonOptions} />
            </FullChartCard>

            <FullChartCard
              title="Salary vs Performance"
              desc="Scatter plot to identify whether high salary gives high performance."
            >
              <Scatter data={scatterData} options={scatterOptions} />
            </FullChartCard>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🏆 Top 10 Employees</h2>
            <p style={styles.sectionDesc}>
              Best performers based on performance score.
            </p>
          </div>

          <div style={styles.tableBox}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {data.top_employees?.[0] &&
                    Object.keys(data.top_employees[0]).map((col) => (
                      <th key={col} style={styles.th}>
                        {col}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {(data.top_employees || []).map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i} style={styles.td}>
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📋 Department Summary Table</h2>
            <p style={styles.sectionDesc}>
              Clean summary table for business reporting.
            </p>
          </div>

          <div style={styles.tableBox}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {data.department_table?.[0] &&
                    Object.keys(data.department_table[0]).map((col) => (
                      <th key={col} style={styles.th}>
                        {col}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {(data.department_table || []).map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i} style={styles.td}>
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function Kpi({ icon, title, value }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiIcon}>{icon}</div>
      <div>
        <p style={styles.kpiTitle}>{title}</p>
        <h3 style={styles.kpiValue}>{value}</h3>
      </div>
    </div>
  );
}

function ChartCard({ title, desc, children }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.chartTitle}>{title}</h3>
      <p style={styles.chartDesc}>{desc}</p>
      <div style={styles.chartBox}>{children}</div>
    </div>
  );
}

function FullChartCard({ title, desc, children }) {
  return (
    <div style={styles.fullCard}>
      <h3 style={styles.chartTitle}>{title}</h3>
      <p style={styles.chartDesc}>{desc}</p>
      <div style={styles.fullChartBox}>{children}</div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "34px",
    color: "#ffffff",
    background:
      "radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 32%), radial-gradient(circle at top right, rgba(168,85,247,0.14), transparent 30%)",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    marginBottom: "28px",
    padding: "28px",
    borderRadius: "26px",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.88), rgba(30,41,59,0.72))",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow: "0 22px 60px rgba(0,0,0,0.32)",
  },

  smallTitle: {
    color: "#93c5fd",
    fontSize: "13px",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    margin: 0,
    fontWeight: "700",
  },

  title: {
    fontSize: "34px",
    margin: "10px 0 0",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: "15px",
    marginTop: "10px",
    maxWidth: "760px",
    lineHeight: "1.7",
  },

  fileBadge: {
    minWidth: "230px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(59,130,246,0.14)",
    border: "1px solid rgba(96,165,250,0.30)",
    color: "#dbeafe",
  },

  fileLabel: {
    display: "block",
    color: "#93c5fd",
    fontSize: "12px",
    marginBottom: "6px",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
    marginBottom: "32px",
  },

  kpiCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "20px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.045))",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
  },

  kpiIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(96,165,250,0.18)",
    border: "1px solid rgba(96,165,250,0.25)",
    fontSize: "20px",
  },

  kpiTitle: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "13px",
  },

  kpiValue: {
    margin: "6px 0 0",
    fontSize: "22px",
    color: "#ffffff",
  },

  section: {
    marginTop: "34px",
  },

  sectionHeader: {
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "25px",
  },

  sectionDesc: {
    color: "#94a3b8",
    marginTop: "8px",
    fontSize: "14px",
  },

  insightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  insightCard: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(15,23,42,0.62)",
    border: "1px solid rgba(148,163,184,0.16)",
    color: "#dbeafe",
    lineHeight: "1.6",
  },

  insightNumber: {
    width: "30px",
    height: "30px",
    minWidth: "30px",
    borderRadius: "10px",
    background: "rgba(96,165,250,0.22)",
    color: "#93c5fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "22px",
  },

  card: {
    padding: "22px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.76), rgba(30,41,59,0.62))",
    border: "1px solid rgba(148,163,184,0.16)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
  },

  fullCard: {
    gridColumn: "1 / -1",
    padding: "22px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.76), rgba(30,41,59,0.62))",
    border: "1px solid rgba(148,163,184,0.16)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
  },

  chartTitle: {
    margin: 0,
    fontSize: "19px",
  },

  chartDesc: {
    color: "#94a3b8",
    marginTop: "8px",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  chartBox: {
    height: "340px",
    marginTop: "18px",
  },

  fullChartBox: {
    height: "420px",
    marginTop: "18px",
  },

  tableBox: {
    overflowX: "auto",
    borderRadius: "22px",
    background: "rgba(15,23,42,0.72)",
    border: "1px solid rgba(148,163,184,0.16)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.25)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "720px",
  },

  th: {
    textAlign: "left",
    padding: "16px",
    background: "rgba(96,165,250,0.14)",
    color: "#dbeafe",
    fontSize: "13px",
    borderBottom: "1px solid rgba(148,163,184,0.18)",
  },

  td: {
    padding: "14px 16px",
    color: "#e5e7eb",
    fontSize: "13px",
    borderBottom: "1px solid rgba(148,163,184,0.10)",
  },

  errorBox: {
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.30)",
    color: "#fecaca",
  },
};