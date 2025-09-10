import React, { useEffect, useState } from 'react';
import './ClientPlans.css';

export default function ClientPlans() {
  const [dietPlan, setDietPlan] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        // --- Fetch Diet Plan ---
        const dietResponse = await fetch("http://localhost:5050/api/user/diet-plan", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!dietResponse.ok) {
          if (dietResponse.status === 404) {
            setDietPlan(null);
          } else {
            const errorData = await dietResponse.json();
            throw new Error(errorData.message || `HTTP error! status: ${dietResponse.status} for diet plan`);
          }
        } else {
          const data = await dietResponse.json();
          setDietPlan(data);
        }

        // --- Fetch Workout Plan ---
        const workoutResponse = await fetch("http://localhost:5050/api/user/workout-plan", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!workoutResponse.ok) {
          if (workoutResponse.status === 404) {
            setWorkoutPlan(null);
          } else {
            const errorData = await workoutResponse.json();
            throw new Error(errorData.message || `HTTP error! status: ${workoutResponse.status} for workout plan`);
          }
        } else {
          const data = await workoutResponse.json();
          setWorkoutPlan(data);
        }

      } catch (err) {
        console.error("Error fetching client plans:", err);
        setError(err.message || "Failed to load your plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientPlans();
  }, []);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="loading-message">
        <p className="message-line1">Loading your assigned plans...</p>
        <p className="message-line2">Please wait while we fetch your details.</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="error-message">
        <p className="message-line1">Error: {error}</p>
        <p className="message-line2">Please ensure you are logged in as a user.</p>
      </div>
    );
  }

  // --- No Plans Assigned (both null) ---
  if (!dietPlan && !workoutPlan) {
    return (
      <div className="no-data-message">
        <p className="message-line1">No plans assigned to you yet.</p>
        <p className="message-line2">Connect with a trainer to get your personalized plans!</p>
      </div>
    );
  }

  // --- Plans Available ---
  return (
    <div className="p-8 max-w-4xl mx-auto client-plans-container">
      {/* Diet Plan Section */}
      <div className="mb-10 plan-section">
        <h3 className="text-2xl font-bold text-green-700 mb-4 plan-title-heading diet">Diet Plan</h3>
        {dietPlan ? (
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 plan-details-card">
            <p className="text-xl font-semibold mb-2">{dietPlan.plan_name}</p>
            <p className="text-gray-600 text-sm mb-3">
              Assigned on: {new Date(dietPlan.assigned_date).toLocaleDateString()}
            </p>
            {dietPlan.plan_details && (
              <div className="space-y-2 text-gray-700">
                {dietPlan.plan_details.description && <p><strong>Description:</strong> {dietPlan.plan_details.description}</p>}
                {dietPlan.plan_details.mealSchedule && (
                  <div>
                    <p className="font-semibold mt-3">Meal Schedule:</p>
                    <ul className="list-disc list-inside ml-4">
                      {typeof dietPlan.plan_details.mealSchedule === 'string' &&
                        dietPlan.plan_details.mealSchedule.split('\n').map((item, index) =>
                          item.trim() && <li key={index}>{item.trim()}</li>
                        )}
                    </ul>
                  </div>
                )}
                {dietPlan.plan_details.calories && <p><strong>Daily Calories:</strong> {dietPlan.plan_details.calories} kcal</p>}
                {dietPlan.plan_details.macros && <p><strong>Macros:</strong> {dietPlan.plan_details.macros}</p>}
                {dietPlan.plan_details.notes && <p><strong>Notes:</strong> {dietPlan.plan_details.notes}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="no-data-message">
            <p className="message-line1">No diet plan assigned to you yet.</p>
            <p className="message-line2">Connect with a trainer to get your personalized diet plan!</p>
          </div>
        )}
      </div>

      {/* Workout Plan Section */}
      <div className="plan-section">
        <h3 className="text-2xl font-bold text-orange-700 mb-4 plan-title-heading workout">Workout Plan</h3>
        {workoutPlan ? (
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 plan-details-card">
            <p className="text-xl font-semibold mb-2">{workoutPlan.plan_name}</p>
            <p className="text-gray-600 text-sm mb-3">
              Assigned on: {new Date(workoutPlan.assigned_date).toLocaleDateString()}
            </p>
            {workoutPlan.plan_details && (
              <div className="space-y-2 text-gray-700">
                {workoutPlan.plan_details.description && <p><strong>Description:</strong> {workoutPlan.plan_details.description}</p>}
                {workoutPlan.plan_details.workoutSchedule && (
                  <div>
                    <p className="font-semibold mt-3">Workout Schedule:</p>
                    <ul className="list-disc list-inside ml-4">
                      {typeof workoutPlan.plan_details.workoutSchedule === 'string' &&
                        workoutPlan.plan_details.workoutSchedule.split('\n').map((item, index) =>
                          item.trim() && <li key={index}>{item.trim()}</li>
                        )}
                    </ul>
                  </div>
                )}
                {workoutPlan.plan_details.durationPerSession && <p><strong>Duration Per Session:</strong> {workoutPlan.plan_details.durationPerSession}</p>}
                {workoutPlan.plan_details.frequency && <p><strong>Frequency:</strong> {workoutPlan.plan_details.frequency}</p>}
                {workoutPlan.plan_details.notes && <p><strong>Notes:</strong> {workoutPlan.plan_details.notes}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="no-data-message">
            <p className="message-line1">No workout plan assigned to you yet.</p>
            <p className="message-line2">Connect with a trainer to get your personalized workout plan!</p>
          </div>
        )}
      </div>
    </div>
  );
}
