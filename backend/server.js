/*const authenticate = require("./middleware/auth");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = 5050;

// ✅ CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Zz$05$zz",
  database: "fitness_platform_copy"
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// ✅ Sign Up
app.post("/api/signup", async (req, res) => {
  const { email, password, role, fullName, phone, age, gender } = req.body;

  if (!email || !password || !role || !fullName || !phone || !age || !gender) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.promise().query(
      "INSERT INTO users (email, password, role, full_name, phone, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [email, hashed, role, fullName, phone, age, gender]
    );

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ error: "User not found" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Save Progress - CORRECTED
app.post("/api/progress", authenticate, async (req, res) => {
  // Destructure all expected fields, including 'date'
  const { date, weight, calories_burned, workouts_done } = req.body;
  const userId = req.user.id;

  // Optional: Add basic validation for date if not already present in frontend
  if (!date || !weight || !calories_burned || !workouts_done) {
    return res.status(400).json({ error: "All progress fields are required." });
  }

  try {
    // Use the 'date' received from the frontend's req.body
    // The frontend is already sending it in 'YYYY-MM-DD' format, so no further formatting needed here
    await db.promise().query(
      "INSERT INTO user_progress (user_id, date, weight, calories_burned, workouts_done) VALUES (?, ?, ?, ?, ?)",
      [userId, date, weight, calories_burned, workouts_done] // Use the 'date' from req.body
    );

    res.json({ message: "Progress saved" });
  } catch (err) {
    console.error("Error saving progress:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// ✅ Get Progress (last 7 days)
app.get("/api/progress", authenticate, async (req, res) => {
  const email = req.user.email;

  try {
    const [userResult] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult[0].id;

    const [progressResults] = await db.promise().query(`
      SELECT * FROM user_progress 
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY date DESC
    `, [userId]);

    res.json(progressResults);
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// ✅ Get User Profile
app.get("/api/user/profile", authenticate, async (req, res) => { // <-- UNCOMMENTED AUTHENTICATE
  const userId = req.user.id; // Now req.user.id will be available

  try {
    const [user] = await db.promise().query(
      "SELECT id, email, role, full_name, phone, age, gender FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user[0]);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ✅ Update User Profile
app.put("/api/user/profile", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { fullName, phone, age, gender } = req.body;

  if (!fullName || !phone || !age || !gender) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await db.promise().query(
      "UPDATE users SET full_name = ?, phone = ?, age = ?, gender = ? WHERE id = ?",
      [fullName, phone, age, gender, userId]
    );
    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
  console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Server error updating profile." });
  }
});

// ✅ Delete User Account
app.delete("/api/user/account", authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    // Optional: Delete related data first from other tables if they have foreign key constraints
    // await db.promise().query("DELETE FROM user_progress WHERE user_id = ?", [userId]);
    // await db.promise().query("DELETE FROM another_table WHERE user_id = ?", [userId]);

    await db.promise().query("DELETE FROM users WHERE id = ?", [userId]);
    res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("Error deleting user account:", err);
    res.status(500).json({ error: "Server error deleting account." });
  }
});

// ✅ Get all Trainers
app.get("/api/trainers", async (req, res) => {
  try {
    const [trainers] = await db.promise().query(
      "SELECT id, full_name, email, phone, age, gender FROM users WHERE role = 'trainer'"
    );
    res.json(trainers);
  } catch (err) {
    console.error("Error fetching trainers:", err);
    res.status(500).json({ error: "Failed to fetch trainers" });
  }
});

// ✅ Modified API endpoint for connections
app.post("/api/connect", authenticate, async (req, res) => {
  const { trainerId, userGoals } = req.body; // userGoals is now an array from frontend
  const userId = req.user.id; // User ID from the authenticated token
  const userName = req.user.full_name; // Assuming full_name is in the token payload
  const userAge = req.user.age;         // Assuming age is in the token payload
  const userMobile = req.user.phone;    // Assuming phone is in the token payload

  // Basic validation for the fields *actually sent or derived*
  if (!trainerId || !userGoals || !Array.isArray(userGoals) || userGoals.length === 0) {
    return res.status(400).json({ message: "Trainer ID and at least one goal are required." });
  }

  let fetchedUserName, fetchedUserAge, fetchedUserMobile;
  try {
    const [userDataResult] = await db.promise().query(
      "SELECT full_name, age, phone FROM users WHERE id = ?",
      [userId]
    );
    if (userDataResult.length === 0) {
      return res.status(404).json({ message: "Authenticated user data not found." });
    }
    fetchedUserName = userDataResult[0].full_name;
    fetchedUserAge = userDataResult[0].age;
    fetchedUserMobile = userDataResult[0].phone;
  } catch (fetchErr) {
    console.error("Error fetching user details for connection:", fetchErr);
    return res.status(500).json({ message: "Failed to retrieve user details." });
  }

  // Convert array of goals to a comma-separated string for storage
  const goalsString = userGoals.join(',');

  try {
    // 1. Check if the trainer exists
    const [trainerExists] = await db.promise().query("SELECT id FROM users WHERE id = ? AND role = 'trainer'", [trainerId]);
    if (trainerExists.length === 0) {
      return res.status(404).json({ message: "Trainer not found." });
    }

    // 2. Check if a connection request from this user to this trainer already exists
    const [existingConnection] = await db.promise().query(
      "SELECT id FROM connections WHERE user_id = ? AND trainer_id = ?",
      [userId, trainerId]
    );

    if (existingConnection.length > 0) {
      return res.status(409).json({ message: "You have already sent a connection request to this trainer." });
    }

    await db.promise().query(
      "INSERT INTO connections (user_id, trainer_id, user_name, user_age, user_mobile, user_goals, request_date) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [userId, trainerId, fetchedUserName, fetchedUserAge, fetchedUserMobile, goalsString]
    );

    res.status(201).json({ message: "Connection request sent successfully!" });

  } catch (err) {
    console.error("Error submitting connection request:", err);
    res.status(500).json({ message: "Failed to process connection request. Server error." });
  }
});

// ✅ Get Connections for Authenticated Trainer
app.get("/api/trainer/connections", authenticate, async (req, res) => {
  // Ensure only trainers can access this endpoint
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: "Access denied. Only trainers can view connections." });
  }

  const trainerId = req.user.id; // The ID of the authenticated trainer

  try {
    const [connections] = await db.promise().query(
      `SELECT
         c.id AS connection_id,
         c.user_id,
         c.user_name,
         c.user_age,
         c.user_mobile,
         c.user_goals,
         c.request_date,
         u.email AS user_email,
         u.gender AS user_gender
       FROM connections c
       JOIN users u ON c.user_id = u.id
       WHERE c.trainer_id = ?
       ORDER BY c.request_date DESC`,
      [trainerId]
    );

    res.status(200).json(connections);
  } catch (err) {
    console.error("Error fetching trainer connections:", err);
    res.status(500).json({ message: "Failed to fetch trainer connections. Server error." });
  }
});

// ✅ Get Progress for a Specific User (Accessible by Trainer) - MODIFIED FOR LAST WEEK
app.get("/api/trainer/client-progress/:userId", authenticate, async (req, res) => {
  // 1. Role Check: Ensure only trainers can access this endpoint
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: "Access denied. Only trainers can view client progress." });
  }

  const trainerId = req.user.id; // The ID of the authenticated trainer
  const clientId = req.params.userId; // The ID of the client whose progress is requested

  // 2. Validate Client ID
  if (!clientId || isNaN(clientId)) {
    return res.status(400).json({ message: "Invalid client ID provided." });
  }

  try {
    // 3. Security Check: Verify that the requested clientId is actually connected to THIS trainer
    const [connectionCheck] = await db.promise().query(
      "SELECT id FROM connections WHERE trainer_id = ? AND user_id = ?",
      [trainerId, clientId]
    );

    if (connectionCheck.length === 0) {
      return res.status(403).json({ message: "Access denied. This user is not connected to your profile." });
    }

    // 4. Fetch Client's Progress - MODIFIED TO FETCH LAST 7 DAYS
    const [progressResults] = await db.promise().query(`
      SELECT date, weight, calories_burned, workouts_done
      FROM user_progress
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY date DESC
    `, [clientId]); // Filter by date for the last 7 days

    res.status(200).json(progressResults);

  } catch (err) {
    console.error(`Error fetching progress for client ${clientId} by trainer ${trainerId}:`, err);
    res.status(500).json({ message: "Failed to fetch client progress. Server error." });
  }
});

// ✅ Trainer: Create/Update Diet Plan for a User
app.post("/api/trainer/diet-plan/:userId", authenticate, async (req, res) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: "Access denied. Only trainers can assign plans." });
  }

  const trainerId = req.user.id;
  const userId = req.params.userId;
  const { planName, planDetails } = req.body; // planDetails should be a JSON object

  if (!planName || !planDetails || typeof planDetails !== 'object') {
    return res.status(400).json({ message: "Plan name and valid plan details are required." });
  }
  if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID provided." });
  }

  try {
    // Security check: Verify the trainer is connected to this user
    const [connectionCheck] = await db.promise().query(
      "SELECT id FROM connections WHERE trainer_id = ? AND user_id = ?",
      [trainerId, userId]
    );
    if (connectionCheck.length === 0) {
      return res.status(403).json({ message: "Access denied. This user is not connected to your profile." });
    }

    // Convert planDetails object to a JSON string for MySQL storage
    const planDetailsJson = JSON.stringify(planDetails);

    // Check if a plan already exists for this user by this trainer
    const [existingPlan] = await db.promise().query(
      "SELECT id FROM diet_plans WHERE user_id = ?", // Assuming one active plan per user
      [userId]
    );

    if (existingPlan.length > 0) {
      // Update existing plan
      await db.promise().query(
        "UPDATE diet_plans SET plan_name = ?, plan_details = ?, assigned_date = CURRENT_DATE WHERE id = ?",
        [planName, planDetailsJson, existingPlan[0].id]
      );
      res.status(200).json({ message: "Diet plan updated successfully!" });
    } else {
      // Insert new plan
      await db.promise().query(
        "INSERT INTO diet_plans (trainer_id, user_id, plan_name, plan_details) VALUES (?, ?, ?, ?)",
        [trainerId, userId, planName, planDetailsJson]
      );
      res.status(201).json({ message: "Diet plan created successfully!" });
    }

  } catch (err) {
    console.error("Error creating/updating diet plan:", err);
    res.status(500).json({ message: "Server error creating/updating diet plan." });
  }
});

// ✅ Trainer: Create/Update Workout Plan for a User
app.post("/api/trainer/workout-plan/:userId", authenticate, async (req, res) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: "Access denied. Only trainers can assign plans." });
  }

  const trainerId = req.user.id;
  const userId = req.params.userId;
  const { planName, planDetails } = req.body; // planDetails should be a JSON object

  if (!planName || !planDetails || typeof planDetails !== 'object') {
    return res.status(400).json({ message: "Plan name and valid plan details are required." });
  }
   if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID provided." });
  }

  try {
    // Security check: Verify the trainer is connected to this user
    const [connectionCheck] = await db.promise().query(
      "SELECT id FROM connections WHERE trainer_id = ? AND user_id = ?",
      [trainerId, userId]
    );
    if (connectionCheck.length === 0) {
      return res.status(403).json({ message: "Access denied. This user is not connected to your profile." });
    }

    const planDetailsJson = JSON.stringify(planDetails);

    // Check if a plan already exists for this user by this trainer
    const [existingPlan] = await db.promise().query(
      "SELECT id FROM workout_plans WHERE user_id = ?", // Assuming one active plan per user
      [userId]
    );

    if (existingPlan.length > 0) {
      // Update existing plan
      await db.promise().query(
        "UPDATE workout_plans SET plan_name = ?, plan_details = ?, assigned_date = CURRENT_DATE WHERE id = ?",
        [planName, planDetailsJson, existingPlan[0].id]
      );
      res.status(200).json({ message: "Workout plan updated successfully!" });
    } else {
      // Insert new plan
      await db.promise().query(
        "INSERT INTO workout_plans (trainer_id, user_id, plan_name, plan_details) VALUES (?, ?, ?, ?)",
        [trainerId, userId, planName, planDetailsJson]
      );
      res.status(201).json({ message: "Workout plan created successfully!" });
    }

  } catch (err) {
    console.error("Error creating/updating workout plan:", err);
    res.status(500).json({ message: "Server error creating/updating workout plan." });
  }
});

// ✅ User: Get Assigned Diet Plan
app.get("/api/user/diet-plan", authenticate, async (req, res) => {
  // Only regular users can fetch their own plan
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: "Access denied. Only users can view their diet plan." });
  }

  const userId = req.user.id;

  try {
    const [dietPlan] = await db.promise().query(
      "SELECT id, plan_name, plan_details, assigned_date FROM diet_plans WHERE user_id = ?",
      [userId]
    );

    if (dietPlan.length === 0) {
      return res.status(404).json({ message: "No diet plan assigned yet." });
    }

    res.status(200).json(dietPlan[0]); // Return the single plan
  } catch (err) {
    console.error("Error fetching user diet plan:", err);
    res.status(500).json({ message: "Server error fetching diet plan." });
  }
});

// ✅ User: Get Assigned Workout Plan
app.get("/api/user/workout-plan", authenticate, async (req, res) => {
  // Only regular users can fetch their own plan
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: "Access denied. Only users can view their workout plan." });
  }

  const userId = req.user.id;

  try {
    const [workoutPlan] = await db.promise().query(
      "SELECT id, plan_name, plan_details, assigned_date FROM workout_plans WHERE user_id = ?",
      [userId]
    );

    if (workoutPlan.length === 0) {
      return res.status(404).json({ message: "No workout plan assigned yet." });
    }

    res.status(200).json(workoutPlan[0]); // Return the single plan
  } catch (err) {
    console.error("Error fetching user workout plan:", err);
    res.status(500).json({ message: "Server error fetching workout plan." });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});*/
const authenticate = require("./middleware/auth");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = 5050;

// ✅ CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Zz$05$zz",
  database: "fitness_platform_copy"
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// ✅ Sign Up
app.post("/api/signup", async (req, res) => {
  const { email, password, role, fullName, phone, age, gender } = req.body;
  if (!email || !password || !role || !fullName || !phone || !age || !gender) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.promise().query(
      "INSERT INTO users (email, password, role, full_name, phone, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [email, hashed, role, fullName, phone, age, gender]
    );
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ error: "User not found" });
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Save Progress
app.post("/api/progress", authenticate, async (req, res) => {
  const { date, weight, calories_burned, workouts_done } = req.body;
  const userId = req.user.id;
  if (!date || !weight || !calories_burned || !workouts_done) {
    return res.status(400).json({ error: "All progress fields are required." });
  }
  try {
    await db.promise().query(
      "INSERT INTO user_progress (user_id, date, weight, calories_burned, workouts_done) VALUES (?, ?, ?, ?, ?)",
      [userId, date, weight, calories_burned, workouts_done]
    );
    res.json({ message: "Progress saved" });
  } catch (err) {
    console.error("Error saving progress:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// ✅ Get Progress (last 7 days)
app.get("/api/progress", authenticate, async (req, res) => {
  const email = req.user.email;
  try {
    const [userResult] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);
    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult[0].id;
    const [progressResults] = await db.promise().query(`
      SELECT * FROM user_progress
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY date DESC
    `, [userId]);
    res.json(progressResults);
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// ✅ Get User Profile
app.get("/api/user/profile", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [user] = await db.promise().query(
      "SELECT id, email, role, full_name, phone, age, gender FROM users WHERE id = ?",
      [userId]
    );
    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user[0]);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// ✅ Update User Profile
app.put("/api/user/profile", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { fullName, phone, age, gender } = req.body;
  if (!fullName || !phone || !age || !gender) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    await db.promise().query(
      "UPDATE users SET full_name = ?, phone = ?, age = ?, gender = ? WHERE id = ?",
      [fullName, phone, age, gender, userId]
    );
    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Server error updating profile." });
  }
});

// ✅ Delete User Account
app.delete("/api/user/account", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    await db.promise().query("DELETE FROM users WHERE id = ?", [userId]);
    res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("Error deleting user account:", err);
    res.status(500).json({ error: "Server error deleting account." });
  }
});

// ✅ Get all Trainers
app.get("/api/trainers", async (req, res) => {
  try {
    const [trainers] = await db.promise().query(
      "SELECT id, full_name, email, phone, age, gender FROM users WHERE role = 'trainer'"
    );
    res.json(trainers);
  } catch (err) {
    console.error("Error fetching trainers:", err);
    res.status(500).json({ error: "Failed to fetch trainers" });
  }
});

// ✅ Modified API endpoint for connections
app.post("/api/connect", authenticate, async (req, res) => {
  const { trainerId, userGoals } = req.body;
  const userId = req.user.id;
  if (!trainerId || !userGoals || !Array.isArray(userGoals) || userGoals.length === 0) {
    return res.status(400).json({ message: "Trainer ID and at least one goal are required." });
  }
  let fetchedUserName, fetchedUserAge, fetchedUserMobile;
  try {
    const [userDataResult] = await db.promise().query(
      "SELECT full_name, age, phone FROM users WHERE id = ?",
      [userId]
    );
    if (userDataResult.length === 0) {
      return res.status(404).json({ message: "Authenticated user data not found." });
    }
    fetchedUserName = userDataResult[0].full_name;
    fetchedUserAge = userDataResult[0].age;
    fetchedUserMobile = userDataResult[0].phone;
  } catch (fetchErr) {
    console.error("Error fetching user details for connection:", fetchErr);
    return res.status(500).json({ message: "Failed to retrieve user details." });
  }
  const goalsString = userGoals.join(',');
  try {
    const [trainerExists] = await db.promise().query("SELECT id FROM users WHERE id = ? AND role = 'trainer'", [trainerId]);
    if (trainerExists.length === 0) {
      return res.status(404).json({ message: "Trainer not found." });
    }
    const [existingConnection] = await db.promise().query(
      "SELECT id FROM connections WHERE user_id = ? AND trainer_id = ?",
      [userId, trainerId]
    );
    if (existingConnection.length > 0) {
      return res.status(409).json({ message: "You have already sent a connection request to this trainer." });
    }
    await db.promise().query(
      "INSERT INTO connections (user_id, trainer_id, user_name, user_age, user_mobile, user_goals, request_date) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [userId, trainerId, fetchedUserName, fetchedUserAge, fetchedUserMobile, goalsString]
    );
    res.status(201).json({ message: "Connection request sent successfully!" });
  } catch (err) {
    console.error("Error submitting connection request:", err);
    res.status(500).json({ message: "Failed to process connection request. Server error." });
  }
});

// ✅ Get Connections for Authenticated Trainer
app.get("/api/trainer/connections", authenticate, async (req, res) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: "Access denied. Only trainers can view connections." });
  }
  const trainerId = req.user.id;
  try {
    const [connections] = await db.promise().query(
      `SELECT
         c.id AS connection_id,
         c.user_id,
         c.user_name,
         c.user_age,
         c.user_mobile,
         c.user_goals,
         c.request_date,
         u.email AS user_email,
         u.gender AS user_gender
       FROM connections c
       JOIN users u ON c.user_id = u.id
       WHERE c.trainer_id = ?
       ORDER BY c.request_date DESC`,
      [trainerId]
    );
    res.status(200).json(connections);
  } catch (err) {
    console.error("Error fetching trainer connections:", err);
    res.status(500).json({ message: "Failed to fetch trainer connections. Server error." });
  }
});

// ✅ Get Progress for a Specific User (Accessible by Trainer)
app.get("/api/trainer/client-progress/:userId", authenticate, async (req, res) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: "Access denied. Only trainers can view client progress." });
  }
  const trainerId = req.user.id;
  const clientId = req.params.userId;
  if (!clientId || isNaN(clientId)) {
    return res.status(400).json({ message: "Invalid client ID provided." });
  }
  try {
    const [connectionCheck] = await db.promise().query(
      "SELECT id FROM connections WHERE trainer_id = ? AND user_id = ?",
      [trainerId, clientId]
    );
    if (connectionCheck.length === 0) {
      return res.status(403).json({ message: "Access denied. This user is not connected to your profile." });
    }
    const [progressResults] = await db.promise().query(`
      SELECT date, weight, calories_burned, workouts_done
      FROM user_progress
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY date DESC
    `, [clientId]);
    res.status(200).json(progressResults);
  } catch (err) {
    console.error(`Error fetching progress for client ${clientId} by trainer ${trainerId}:`, err);
    res.status(500).json({ message: "Failed to fetch client progress. Server error." });
  }
});

// ✅ Trainer: Create/Update Diet Plan for a User
app.post("/api/trainer/diet-plan/:userId", authenticate, async (req, res) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: "Access denied. Only trainers can assign plans." });
  }
  const trainerId = req.user.id;
  const userId = req.params.userId;
  const { planName, planDetails } = req.body;
  if (!planName || !planDetails || typeof planDetails !== 'object') {
    return res.status(400).json({ message: "Plan name and valid plan details are required." });
  }
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID provided." });
  }
  try {
    const [connectionCheck] = await db.promise().query(
      "SELECT id FROM connections WHERE trainer_id = ? AND user_id = ?",
      [trainerId, userId]
    );
    if (connectionCheck.length === 0) {
      return res.status(403).json({ message: "Access denied. This user is not connected to your profile." });
    }
    const planDetailsJson = JSON.stringify(planDetails);
    const [existingPlan] = await db.promise().query(
      "SELECT id FROM diet_plans WHERE user_id = ?",
      [userId]
    );
    if (existingPlan.length > 0) {
      await db.promise().query(
        "UPDATE diet_plans SET plan_name = ?, plan_details = ?, assigned_date = CURRENT_DATE WHERE id = ?",
        [planName, planDetailsJson, existingPlan[0].id]
      );
      res.status(200).json({ message: "Diet plan updated successfully!" });
    } else {
      await db.promise().query(
        "INSERT INTO diet_plans (trainer_id, user_id, plan_name, plan_details) VALUES (?, ?, ?, ?)",
        [trainerId, userId, planName, planDetailsJson]
      );
      res.status(201).json({ message: "Diet plan created successfully!" });
    }
  } catch (err) {
    console.error("Error creating/updating diet plan:", err);
    res.status(500).json({ message: "Server error creating/updating diet plan." });
  }
});

// ✅ Trainer: Create/Update Workout Plan for a User
app.post("/api/trainer/workout-plan/:userId", authenticate, async (req, res) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: "Access denied. Only trainers can assign plans." });
  }
  const trainerId = req.user.id;
  const userId = req.params.userId;
  const { planName, planDetails } = req.body;
  if (!planName || !planDetails || typeof planDetails !== 'object') {
    return res.status(400).json({ message: "Plan name and valid plan details are required." });
  }
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID provided." });
  }
  try {
    const [connectionCheck] = await db.promise().query(
      "SELECT id FROM connections WHERE trainer_id = ? AND user_id = ?",
      [trainerId, userId]
    );
    if (connectionCheck.length === 0) {
      return res.status(403).json({ message: "Access denied. This user is not connected to your profile." });
    }
    const planDetailsJson = JSON.stringify(planDetails);
    const [existingPlan] = await db.promise().query(
      "SELECT id FROM workout_plans WHERE user_id = ?",
      [userId]
    );
    if (existingPlan.length > 0) {
      await db.promise().query(
        "UPDATE workout_plans SET plan_name = ?, plan_details = ?, assigned_date = CURRENT_DATE WHERE id = ?",
        [planName, planDetailsJson, existingPlan[0].id]
      );
      res.status(200).json({ message: "Workout plan updated successfully!" });
    } else {
      await db.promise().query(
        "INSERT INTO workout_plans (trainer_id, user_id, plan_name, plan_details) VALUES (?, ?, ?, ?)",
        [trainerId, userId, planName, planDetailsJson]
      );
      res.status(201).json({ message: "Workout plan created successfully!" });
    }
  } catch (err) {
    console.error("Error creating/updating workout plan:", err);
    res.status(500).json({ message: "Server error creating/updating workout plan." });
  }
});

// ✅ User: Get Assigned Diet Plan
app.get("/api/user/diet-plan", authenticate, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: "Access denied. Only users can view their diet plan." });
  }
  const userId = req.user.id;
  try {
    const [dietPlan] = await db.promise().query(
      "SELECT id, plan_name, plan_details, assigned_date FROM diet_plans WHERE user_id = ?",
      [userId]
    );
    if (dietPlan.length === 0) {
      return res.status(404).json({ message: "No diet plan assigned yet." });
    }
    res.status(200).json(dietPlan[0]);
  } catch (err) {
    console.error("Error fetching user diet plan:", err);
    res.status(500).json({ message: "Server error fetching diet plan." });
  }
});

// ✅ User: Get Assigned Workout Plan
app.get("/api/user/workout-plan", authenticate, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: "Access denied. Only users can view their workout plan." });
  }
  const userId = req.user.id;
  try {
    const [workoutPlan] = await db.promise().query(
      "SELECT id, plan_name, plan_details, assigned_date FROM workout_plans WHERE user_id = ?",
      [userId]
    );
    if (workoutPlan.length === 0) {
      return res.status(404).json({ message: "No workout plan assigned yet." });
    }
    res.status(200).json(workoutPlan[0]);
  } catch (err) {
    console.error("Error fetching user workout plan:", err);
    res.status(500).json({ message: "Server error fetching workout plan." });
  }
});

// ✅ New Endpoint: Get a User's Connected Trainer
app.get("/api/user/my-trainer", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [connection] = await db.promise().query(
      `SELECT
         t.id, t.full_name, t.email, t.role, t.phone, t.age, t.gender
       FROM connections c
       JOIN users t ON c.trainer_id = t.id
       WHERE c.user_id = ?`,
      [userId]
    );
    if (connection.length === 0) {
      return res.status(404).json({ message: "No connected trainer found." });
    }
    res.json(connection[0]);
  } catch (err) {
    console.error("Error fetching connected trainer:", err);
    res.status(500).json({ message: "Server error fetching trainer." });
  }
});

// New Endpoint: Get all trainers a user is connected to
app.get("/api/user/my-trainers", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [trainers] = await db.promise().query(
      `SELECT
         t.id, t.full_name, t.email, t.role, t.phone, t.age, t.gender
       FROM connections c
       JOIN users t ON c.trainer_id = t.id
       WHERE c.user_id = ?`,
      [userId]
    );
    res.json(trainers);
  } catch (err) {
    console.error("Error fetching connected trainers:", err);
    res.status(500).json({ message: "Server error fetching trainers." });
  }
});

// New Endpoint: Search for other trainers
app.get("/api/trainers/search", authenticate, async (req, res) => {
  const { query } = req.query; // Get the search query from the URL
  const userId = req.user.id;  // Get the current user's ID
  
  if (!query || query.length < 2) {
    return res.status(400).json({ message: "Search query must be at least 2 characters long." });
  }

  try {
    const searchQuery = `%${query}%`;
    
    // Find trainers who match the search query but are not the current user
    const [trainers] = await db.promise().query(
      `SELECT id, full_name, email, phone, age, gender 
       FROM users 
       WHERE role = 'trainer' 
       AND id != ? 
       AND full_name LIKE ?`,
      [userId, searchQuery]
    );

    if (trainers.length === 0) {
      return res.status(404).json({ message: "No trainers found matching your search." });
    }

    res.json(trainers);
  } catch (err) {
    console.error("Error searching for trainers:", err);
    res.status(500).json({ message: "Server error during search." });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});



