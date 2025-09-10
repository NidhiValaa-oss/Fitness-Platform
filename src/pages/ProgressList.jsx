import { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import './ProgressList.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Utility function to get a consistent YYYY-MM-DD local date string
const getLocalFormattedDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ProgressList() {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedForLog = [...res.data].sort((a, b) => new Date(b.date) - new Date(a.date));
        const sortedForCharts = [...res.data].sort((a, b) => new Date(a.date) - new Date(b.date));
        setProgressList(sortedForLog);
        updateChartData(sortedForCharts);
      } catch (err) {
        console.error("Error fetching progress:", err);
        setError("Failed to load progress. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [token]);

  const [weightChartData, setWeightChartData] = useState({});
  const [caloriesChartData, setCaloriesChartData] = useState({});
  const [workoutsChartData, setWorkoutsChartData] = useState({});
  const [goalChartData, setGoalChartData] = useState({});

  const updateChartData = (data) => {
    const dates = data.map((p) => new Date(p.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }));
    const weights = data.map((p) => p.weight);
    const caloriesBurned = data.map((p) => p.calories_burned);
    const workoutsDone = data.map((p) => p.workouts_done);

    // FIX: Use the new utility function for consistent date comparison
    const todayFormatted = getLocalFormattedDate(new Date());

    const dailyWorkoutTotal = data
      .filter(p => getLocalFormattedDate(p.date) === todayFormatted)
      .reduce((sum, p) => sum + p.workouts_done, 0);

    const dailyWorkoutGoal = 3;

    setWeightChartData({
      labels: dates,
      datasets: [{
        label: "Weight (kg)",
        data: weights,
        borderColor: "#313864",
        backgroundColor: "rgba(49, 56, 100, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#313864",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
      }],
    });

    setCaloriesChartData({
      labels: dates,
      datasets: [{
        label: "Calories Burned",
        data: caloriesBurned,
        backgroundColor: "#F7C101",
        borderColor: "#F7C101",
        borderWidth: 1,
        borderRadius: 4,
      }],
    });

    setWorkoutsChartData({
      labels: dates,
      datasets: [{
        label: "Workouts Done",
        data: workoutsDone,
        backgroundColor: "#5ED2EB",
        borderColor: "#5ED2EB",
        borderWidth: 1,
        borderRadius: 4,
      }],
    });

    setGoalChartData({
      labels: ["Completed", "Remaining"],
      datasets: [{
        data: [
          Math.min(dailyWorkoutTotal, dailyWorkoutGoal),
          Math.max(0, dailyWorkoutGoal - dailyWorkoutTotal),
        ],
        backgroundColor: ["#F66972", "#E5E7EB"],
        hoverOffset: 6,
        borderWidth: 0,
      }],
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0,0,0,0.7)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        ticks: {
          display: true,
          maxRotation: 45,
          minRotation: 45,
          font: { size: 10 },
          color: "var(--color-dark-blue)",
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: {
          display: true,
          font: { size: 10 },
          color: "var(--color-dark-blue)",
        },
        grid: { color: "rgba(49, 56, 100, 0.1)" },
        border: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed}`;
          },
        },
        backgroundColor: "rgba(0,0,0,0.7)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
      },
    },
    hover: {
    mode: null // Disables all hover effects that would modify the chart visually
  }
  };

  const totalWorkouts = progressList.reduce((sum, p) => sum + p.workouts_done, 0);
  const latestWeight = progressList.length > 0 ? progressList[0].weight : "N/A";
  const averageCalories = progressList.length > 0
    ? (progressList.reduce((sum, p) => sum + p.calories_burned, 0) / progressList.length).toFixed(0)
    : "N/A";

  // FIX: Use the utility function here as well for the summary card
  const todayFormatted = getLocalFormattedDate(new Date());
  const dailyWorkoutTotal = progressList
    .filter(p => getLocalFormattedDate(p.date) === todayFormatted)
    .reduce((sum, p) => sum + p.workouts_done, 0);

  const recentProgressEntries = progressList.slice(0, 4);

  return (
    <div className="progress-dashboard-container">
      <h1 className="dashboard-title">My Fitness Dashboard</h1>
      {loading ? (
        <p className="loading-message">Loading your fitness data...</p>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <p className="error-tip">Please ensure you are logged in and the server is running.</p>
        </div>
      ) : progressList.length === 0 ? (
        <div className="no-data-message">
          <p>No progress data available yet. Start tracking your fitness journey!</p>
          <p className="no-data-tip">Log your first workout or weight entry to see your progress here.</p>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="summary-cards-grid">
            <SummaryCard icon={<i className="fas fa-weight-scale"></i>} label="Current Weight" value={`${latestWeight} kg`} color="dark-blue" />
            <SummaryCard icon={<i className="fas fa-dumbbell"></i>} label="Total Workouts" value={totalWorkouts} color="pink" />
            <SummaryCard icon={<i className="fas fa-fire"></i>} label="Avg. Calories" value={averageCalories} color="yellow" />
            <SummaryCard icon={<i className="fas fa-bullseye"></i>} label="Workouts Today" value={`${Math.min(dailyWorkoutTotal, 3)}/3`} color="light-blue" />
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Weight Trend Over Time</h3>
            <div className="chart-container">
              {Object.keys(weightChartData).length > 0 && <Line data={weightChartData} options={chartOptions} />}
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3 className="chart-title">Calories Burned</h3>
              <div className="chart-container">
                {Object.keys(caloriesChartData).length > 0 && <Bar data={caloriesChartData} options={chartOptions} />}
              </div>
            </div>

            <div className="chart-card goal-chart-card">
              <h3 className="chart-title">Daily Workout Goal Progress</h3>
              <div className="doughnut-chart-wrapper">
                {Object.keys(goalChartData).length > 0 && (
                  <>
                    <Doughnut data={goalChartData} options={doughnutOptions} />
                    <div className="doughnut-percentage">
                      {Math.round((Math.min(dailyWorkoutTotal, 3) / 3) * 100)}%
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="recent-activity-section">
            <h3 className="section-title">Recent Activity</h3>
            <div className="activity-grid">
              {recentProgressEntries.map((p, index) => (
                <div key={p._id || index} className="activity-card">
                  <div className="activity-date">
                    <span className="activity-icon"><i className="fas fa-calendar-alt"></i></span> {new Date(p.date).toLocaleDateString()}
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon"><i className="fas fa-weight-hanging"></i></span> Weight: <span className="activity-value">{p.weight} kg</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon"><i className="fas fa-burn"></i></span> Calories: <span className="activity-value">{p.calories_burned}</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon"><i className="fas fa-running"></i></span> Workouts: <span className="activity-value">{p.workouts_done}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div className={`summary-card summary-card-${color}`}>
      <div className="summary-card-icon">{icon}</div>
      <p className="summary-card-value">{value}</p>
      <p className="summary-card-label">{label}</p>
    </div>
  );
}