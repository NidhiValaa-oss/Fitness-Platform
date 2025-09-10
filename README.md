🏋️‍♀️ Online Fitness Coaching and Progress Tracking Platform
The Online Fitness Coaching and Progress Tracking Platform is a comprehensive web-based solution that connects fitness enthusiasts with certified trainers and delivers personalized, goal-oriented programs. It enables users to create detailed profiles, set health objectives, follow tailored workout and nutrition plans, and track progress through intuitive dashboards and analytics. Trainers can manage multiple clients, monitor progress via logged workouts and health metrics, and provide real-time guidance through integrated chat and media sharing tools.

With role-specific dashboards, advanced analytics, and a responsive design accessible across devices, the platform ensures seamless interaction, improved accountability, and consistent progress. It is scalable for gyms, freelance coaches, and wellness startups, offering a unified, flexible, and results-driven digital fitness experience.

🚀 Key Features
🔑 Secure Authentication (role-based access for Users & Trainers)

📊 Interactive Dashboards for Users and Trainers

📝 Workout & Nutrition Logging

📈 Health Metrics Tracking (weight, BMI, body measurements)

💬 Chat & Media Sharing between users and trainers

🎯 Trainer Dashboard for client monitoring and management

🧾 Profile Management (view/edit profile)

🗂️ Your Plans & Progress Tracking

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

Database: MySQL

Authentication: JWT

Version Control: Git & GitHub

📸 Screenshots
(Screenshots are saved in public/assets/screenshots/ folder)

🏠 Home Page

🔐 Login Page

✍️ Sign Up Page

📊 User Dashboard

➕ Add Progress

👀 View Trainers

📋 Your Plans

💬 Chat with Trainers

👤 View Profile

👤 Edit Profile

🎯 Trainer Dashboard

⚙️ Installation & Setup
1️⃣ Clone the Repository

Bash
git clone https://github.com/NidhiValaa-oss/Fitness-Platform.git
cd Fitness-Platform
2️⃣ Install Backend Dependencies

Bash
cd backend
npm install
Create a .env file inside backend/:

Code snippet
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=fitness_platform
JWT_SECRET=your_jwt_secret
Start the backend:

Bash
npm start
3️⃣ Install Frontend Dependencies

Bash
cd ../
npm install
Start the frontend:

Bash
npm run dev
The frontend runs at http://localhost:5173 (Vite default).

▶️ Usage
Register as a User or Trainer.

Users can set health goals, log workouts & nutrition, track progress, view trainers, manage plans, and chat with trainers.

Trainers can monitor clients, view progress, chat, and manage the trainer dashboard.

Users can view and edit their profile at any time.

📂 Folder Structure
fitness-platform copy/
│── backend/           # Node.js + Express.js API
│   ├── middleware/
│   ├── node_modules/
│   ├── .env
│   ├── package.json
│   └── server.js
│── public/            # Screenshots & images
│   ├── assets/
│   └── screenshots/
│       ├── Picture1.png
│       ├── Picture2.png
│       └── ...
│── src/               # React frontend source code
│   ├── components/
│   ├── pages/
│   └── assets/
│── README.md          # Project documentation
👩‍💻 Author
Nidhi Vala

🌐 GitHub: [https://github.com/NidhiValaa-oss]

💼 LinkedIn: [https://www.linkedin.com/in/nidhi-vala-b04813383]

If you found this project helpful, please star ⭐ the repository on GitHub.