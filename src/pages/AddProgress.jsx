import { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Essential for base calendar styles
import './AddProgress.css'; // Your custom CSS for the form and inline calendar

export default function AddProgress() {
  const [formData, setFormData] = useState({
    date: new Date(), // Initialize with a Date object for DatePicker
    weight: "",
    calories_burned: "",
    workouts_done: "",
  });

  const token = localStorage.getItem("token");

  // Handle date change specifically for DatePicker
  const handleDateChange = (date) => {
    setFormData({ ...formData, date: date });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format the date to 'YYYY-MM-DD' before sending to the backend
    const formattedDate = formData.date.toISOString().split('T')[0];

    try {
      await axios.post("http://localhost:5050/api/progress", {
        ...formData,
        date: formattedDate // Use the formatted date
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Progress added successfully!");
      setFormData({ date: new Date(), weight: "", calories_burned: "", workouts_done: "" }); // Reset date to current date
    } catch (err) {
      console.error("Error adding progress:", err);
      alert("Failed to add progress.");
    }
  };

  return (
    <div className="add-progress-container">
      <h2 className="text-2xl font-bold">Add New Progress</h2>

      <div className="calendar-and-inputs-wrapper">
        {/* The Inline Date Picker */}
        <div className="inline-calendar-wrapper">
          <DatePicker
            selected={formData.date}
            onChange={handleDateChange}
            inline // This prop makes the calendar always visible
            showMonthDropdown // Enables a dropdown for month selection
            showYearDropdown // Enables a dropdown for year selection
            dropdownMode="select" // Use 'select' for native dropdowns (simpler)
          />
        </div>

        {/* The rest of your form inputs */}
        <form onSubmit={handleSubmit} className="add-progress-form-inputs">
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Weight (kg)"
            required
          />
          <input
            type="number"
            name="calories_burned"
            value={formData.calories_burned}
            onChange={handleChange}
            placeholder="Calories Burned"
            required
          />
          <input
            type="number"
            name="workouts_done"
            value={formData.workouts_done}
            onChange={handleChange}
            placeholder="Workouts Done"
            required
          />
          <button type="submit">Add</button>
        </form>
      </div> {/* End calendar-and-inputs-wrapper */}
    </div>
  );
}