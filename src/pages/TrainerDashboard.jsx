import React, { useEffect, useState } from 'react';
import './TrainerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
faUserGroup,
faExclamationTriangle,
faSpinner,
faChartLine,
faUtensils,
faDumbbell,
faTimes,
faClipboardList,
faPenToSquare,
faCalendarDays,
faFire,
faCalculator,
faNoteSticky,
faClock,
faRepeat,
faComment
} from '@fortawesome/free-solid-svg-icons';
import Chat from '../components/Chat';

// It is assumed you have an AuthContext to manage user state.
// If you don't, this code will need to be adapted.
// For example: `const { user, token } = useAuth();`
// For this code, we'll assume a simplified localStorage setup.

// Reusable Modal Components (for diet and workout plans)
const DietPlanModal = ({ client, onClose }) => {
// ... (Your existing DietPlanModal code) ...
const [dietPlanDetails, setDietPlanDetails] = useState({
planName: '',
description: '',
mealSchedule: '',
calories: '',
macros: '',
notes: ''
});
const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState(null);
const [submitSuccess, setSubmitSuccess] = useState(false);

const handleChange = (e) => {
const { name, value } = e.target;
setDietPlanDetails(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
e.preventDefault();
setSubmitting(true);
setSubmitError(null);
setSubmitSuccess(false);

if (!client || !client.user_id) {
setSubmitError("No client selected for this plan.");
setSubmitting(false);
return;
}
if (!dietPlanDetails.planName || !dietPlanDetails.mealSchedule) {
setSubmitError("Plan Name and Meal Schedule are required.");
setSubmitting(false);
return;
}

try {
const token = localStorage.getItem('token');
if (!token) {
throw new Error("Authentication token missing. Please log in.");
}

const response = await fetch(`http://localhost:5050/api/trainer/diet-plan/${client.user_id}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${token}`
},
body: JSON.stringify({
planName: dietPlanDetails.planName,
planDetails: {
description: dietPlanDetails.description,
mealSchedule: dietPlanDetails.mealSchedule,
calories: dietPlanDetails.calories,
macros: dietPlanDetails.macros,
notes: dietPlanDetails.notes
}
}),
});

if (!response.ok) {
const errorData = await response.json();
throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
}

setSubmitSuccess(true);
setTimeout(() => {
onClose();
setDietPlanDetails({
planName: '', description: '', mealSchedule: '', calories: '', macros: '', notes: ''
});
}, 1500);
} catch (err) {
console.error("Error creating diet plan:", err);
setSubmitError(err.message || "Failed to create diet plan. Please try again.");
} finally {
setSubmitting(false);
}
};
if (!client) return null;
return (
<div className="plan-modal-overlay">
<div className="plan-modal-content">
<button onClick={onClose} className="plan-modal-close-button"><FontAwesomeIcon icon={faTimes} /></button>
<h3 className="plan-modal-title diet-plan-title">Create Diet Plan for {client.user_name}</h3>
<form onSubmit={handleSubmit} className="plan-form">
<div className="plan-form-group">
<label htmlFor="planName" className="plan-form-label"><FontAwesomeIcon icon={faClipboardList} className="mr-2 text-gray-500" />Plan Name</label>
<input type="text" id="planName" name="planName" value={dietPlanDetails.planName} onChange={handleChange} className="plan-form-input" required />
</div>
<div className="plan-form-group">
<label htmlFor="description" className="plan-form-label"><FontAwesomeIcon icon={faPenToSquare} className="mr-2 text-gray-500" />Description</label>
<textarea id="description" name="description" value={dietPlanDetails.description} onChange={handleChange} rows="3" className="plan-form-textarea"></textarea>
</div>
<div className="plan-form-group">
<label htmlFor="mealSchedule" className="plan-form-label"><FontAwesomeIcon icon={faCalendarDays} className="mr-2 text-gray-500" />Meal Schedule (one item per line)</label>
<textarea id="mealSchedule" name="mealSchedule" value={dietPlanDetails.mealSchedule} onChange={handleChange} rows="5" className="plan-form-textarea" required></textarea>
</div>
<div className="plan-form-group">
<label htmlFor="calories" className="plan-form-label"><FontAwesomeIcon icon={faFire} className="mr-2 text-gray-500" />Total Daily Calories</label>
<input type="number" id="calories" name="calories" value={dietPlanDetails.calories} onChange={handleChange} className="plan-form-input" />
</div>
<div className="plan-form-group">
<label htmlFor="macros" className="plan-form-label"><FontAwesomeIcon icon={faCalculator} className="mr-2 text-gray-500" />Macros (e.g., P:150 C:200 F:50)</label>
<input type="text" id="macros" name="macros" value={dietPlanDetails.macros} onChange={handleChange} className="plan-form-input" />
</div>
<div className="plan-form-group">
<label htmlFor="notes" className="plan-form-label"><FontAwesomeIcon icon={faNoteSticky} className="mr-2 text-gray-500" />Notes</label>
<textarea id="notes" name="notes" value={dietPlanDetails.notes} onChange={handleChange} rows="2" className="plan-form-textarea"></textarea>
</div>
{submitError && (<p className="plan-form-message plan-form-error">{submitError}</p>)}
{submitSuccess && (<p className="plan-form-message plan-form-success">Diet plan created successfully!</p>)}
<div className="text-center">
<button type="submit" className={`plan-form-submit-button diet-plan-submit-button ${submitting ? 'plan-form-submit-button:disabled' : ''}`} disabled={submitting}>
{submitting ? 'Creating...' : 'Create Plan'}
</button>
</div>
</form>
</div>
</div>
);
};
const WorkoutPlanModal = ({ client, onClose }) => {
// ... (Your existing WorkoutPlanModal code) ...
const [workoutPlanDetails, setWorkoutPlanDetails] = useState({
planName: '',
description: '',
workoutSchedule: '',
durationPerSession: '',
frequency: '',
notes: ''
});
const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState(null);
const [submitSuccess, setSubmitSuccess] = useState(false);
const handleChange = (e) => {
const { name, value } = e.target;
setWorkoutPlanDetails(prev => ({ ...prev, [name]: value }));
};
const handleSubmit = async (e) => {
e.preventDefault();
setSubmitting(true);
setSubmitError(null);
setSubmitSuccess(false);
if (!client || !client.user_id) {
setSubmitError("No client selected for this plan.");
setSubmitting(false);
return;
}
if (!workoutPlanDetails.planName || !workoutPlanDetails.workoutSchedule) {
setSubmitError("Plan Name and Workout Schedule are required.");
setSubmitting(false);
return;
}
try {
const token = localStorage.getItem('token');
if (!token) {
throw new Error("Authentication token missing. Please log in.");
}
const response = await fetch(`http://localhost:5050/api/trainer/workout-plan/${client.user_id}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${token}`
},
body: JSON.stringify({
planName: workoutPlanDetails.planName,
planDetails: {
description: workoutPlanDetails.description,
workoutSchedule: workoutPlanDetails.workoutSchedule,
durationPerSession: workoutPlanDetails.durationPerSession,
frequency: workoutPlanDetails.frequency,
notes: workoutPlanDetails.notes
}
}),
});
if (!response.ok) {
const errorData = await response.json();
throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
}
setSubmitSuccess(true);
setTimeout(() => {
onClose();
setWorkoutPlanDetails({
planName: '', description: '', workoutSchedule: '', durationPerSession: '', frequency: '', notes: ''
});
}, 1500);
} catch (err) {
console.error("Error creating workout plan:", err);
setSubmitError(err.message || "Failed to create workout plan. Please try again.");
} finally {
setSubmitting(false);
}
};
if (!client) return null;
return (
<div className="plan-modal-overlay">
<div className="plan-modal-content">
<button onClick={onClose} className="plan-modal-close-button"><FontAwesomeIcon icon={faTimes} /></button>
<h3 className="plan-modal-title workout-plan-title">Create Workout Plan for {client.user_name}</h3>
<form onSubmit={handleSubmit} className="plan-form">
<div className="plan-form-group">
<label htmlFor="workoutPlanName" className="plan-form-label"><FontAwesomeIcon icon={faClipboardList} className="mr-2 text-gray-500" />Plan Name</label>
<input type="text" id="workoutPlanName" name="planName" value={workoutPlanDetails.planName} onChange={handleChange} className="plan-form-input" required />
</div>
<div className="plan-form-group">
<label htmlFor="workoutDescription" className="plan-form-label"><FontAwesomeIcon icon={faPenToSquare} className="mr-2 text-gray-500" />Description</label>
<textarea id="workoutDescription" name="description" value={workoutPlanDetails.description} onChange={handleChange} rows="3" className="plan-form-textarea"></textarea>
</div>
<div className="plan-form-group">
<label htmlFor="workoutSchedule" className="plan-form-label"><FontAwesomeIcon icon={faCalendarDays} className="mr-2 text-gray-500" />Workout Schedule (one item per line)</label>
<textarea id="workoutSchedule" name="workoutSchedule" value={workoutPlanDetails.workoutSchedule} onChange={handleChange} rows="5" className="plan-form-textarea" required></textarea>
</div>
<div className="plan-form-group">
<label htmlFor="durationPerSession" className="plan-form-label"><FontAwesomeIcon icon={faClock} className="mr-2 text-gray-500" />Duration Per Session (e.g., 60 minutes)</label>
<input type="text" id="durationPerSession" name="durationPerSession" value={workoutPlanDetails.durationPerSession} onChange={handleChange} className="plan-form-input" />
</div>
<div className="plan-form-group">
<label htmlFor="frequency" className="plan-form-label"><FontAwesomeIcon icon={faRepeat} className="mr-2 text-gray-500" />Frequency (e.g., 4 times a week)</label>
<input type="text" id="frequency" name="frequency" value={workoutPlanDetails.frequency} onChange={handleChange} className="plan-form-input" />
</div>
<div className="plan-form-group">
<label htmlFor="workoutNotes" className="plan-form-label"><FontAwesomeIcon icon={faNoteSticky} className="mr-2 text-gray-500" />Notes</label>
<textarea id="workoutNotes" name="notes" value={workoutPlanDetails.notes} onChange={handleChange} rows="2" className="plan-form-textarea"></textarea>
</div>
{submitError && (<p className="plan-form-message plan-form-error">{submitError}</p>)}
{submitSuccess && (<p className="plan-form-message plan-form-success">Workout plan created successfully!</p>)}
<div className="text-center">
<button type="submit" className={`plan-form-submit-button workout-plan-submit-button ${submitting ? 'plan-form-submit-button:disabled' : ''}`} disabled={submitting}>
{submitting ? 'Creating...' : 'Create Plan'}
</button>
</div>
</form>
</div>
</div>
);
};

export default function TrainerDashboard() {
const [connections, setConnections] = useState([]);
const [loadingConnections, setLoadingConnections] = useState(true);
const [connectionsError, setConnectionsError] = useState(null);
const [selectedClientProgress, setSelectedClientProgress] = useState([]);
const [loadingClientProgress, setLoadingClientProgress] = useState(false);
const [clientProgressError, setClientProgressError] = useState(null);
const [viewingClientName, setViewingClientName] = useState('');
const [showDietPlanModal, setShowDietPlanModal] = useState(false);
const [showWorkoutPlanModal, setShowWorkoutPlanModal] = useState(false);
const [selectedClientForPlan, setSelectedClientForPlan] = useState(null);
const [showChatModal, setShowChatModal] = useState(false);
const [selectedClientForChat, setSelectedClientForChat] = useState(null);
const [currentTrainer, setCurrentTrainer] = useState(null);

useEffect(() => {
const fetchTrainerData = async () => {
try {
setLoadingConnections(true);
setConnectionsError(null);
const token = localStorage.getItem('token');
if (!token) {
throw new Error("No authentication token found. Please log in as a trainer.");
}
// Fetch current trainer's profile data
const profileResponse = await fetch("http://localhost:5050/api/user/profile", {
method: "GET",
headers: {
"Authorization": `Bearer ${token}`
}
});
if (!profileResponse.ok) {
throw new Error("Failed to fetch trainer profile.");
}
const trainerData = await profileResponse.json();
setCurrentTrainer(trainerData);

// Fetch trainer's connections
const connectionsResponse = await fetch("http://localhost:5050/api/trainer/connections", {
method: "GET",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${token}`
},
});
if (!connectionsResponse.ok) {
const errorData = await connectionsResponse.json();
if (connectionsResponse.status === 403) {
throw new Error("Access denied. You do not have trainer permissions.");
}
throw new Error(errorData.message || `HTTP error! status: ${connectionsResponse.status}`);
}
const connectionsData = await connectionsResponse.json();
setConnections(connectionsData);
} catch (err) {
console.error("Error fetching trainer connections:", err);
setConnectionsError(err.message || "Failed to load connections. Please try again.");
} finally {
setLoadingConnections(false);
}
};
fetchTrainerData();
}, []);

const handleViewProgress = async (clientId, clientName) => {
setLoadingClientProgress(true);
setClientProgressError(null);
setSelectedClientProgress([]);
setViewingClientName(clientName);
try {
const token = localStorage.getItem('token');
if (!token) {
throw new Error("Authentication token missing for progress view.");
}
const response = await fetch(`http://localhost:5050/api/trainer/client-progress/${clientId}`, {
method: "GET",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${token}`
},
});
if (!response.ok) {
const errorData = await response.json();
if (response.status === 403) {
throw new Error(`Access denied. You are not authorized to view ${clientName}'s progress.`);
}
throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
}
const data = await response.json();
setSelectedClientProgress(data);
} catch (err) {
console.error(`Error fetching progress for client ${clientId}:`, err);
setClientProgressError(err.message || `Failed to load ${clientName}'s progress.`);
} finally {
setLoadingClientProgress(false);
}
};

const handleCreateDietPlan = (client) => {
setSelectedClientForPlan(client);
setShowDietPlanModal(true);
};
const handleCreateWorkoutPlan = (client) => {
setSelectedClientForPlan(client);
setShowWorkoutPlanModal(true);
};
const handleStartChat = (client) => {
setSelectedClientForChat(client);
setShowChatModal(true);
};
const closeModals = () => {
setShowDietPlanModal(false);
setShowWorkoutPlanModal(false);
setShowChatModal(false);
setSelectedClientForPlan(null);
setSelectedClientForChat(null);
};
if (loadingConnections) {
return (
<div className="trainer-dashboard-container">
<div className="dashboard-info-message loading">
<FontAwesomeIcon icon={faSpinner} spin className="message-icon" />
<p className="message-text">Loading your client connections...</p>
</div>
</div>
);
}
if (connectionsError) {
return (
<div className="trainer-dashboard-container">
<div className="dashboard-info-message error">
<FontAwesomeIcon icon={faExclamationTriangle} className="message-icon" />
<p className="message-text">Error loading connections: {connectionsError}</p>
<p className="message-tip">Please ensure you are logged in as a trainer and have the correct permissions.</p>
</div>
</div>
);
}
return (
<div className="trainer-dashboard-container">
<h2 className="trainer-dashboard-title">
<FontAwesomeIcon icon={faUserGroup} className="mr-3 text-yellow-600" />Your Client Connections
</h2>
<hr className="dashboard-divider" />
{connections.length === 0 ? (
<div className="dashboard-info-message">
<FontAwesomeIcon icon={faUserGroup} className="message-icon" />
<p className="message-text">No client connections at the moment.</p>
<p className="message-tip">As a trainer, clients can connect with you from the "Trainers" page.</p>
</div>
) : (
<div className="connections-grid">
{connections.map((conn) => (
<div key={conn.connection_id} className="client-card">
<h3 className="client-card-name">{conn.user_name}</h3>
<p><strong>Email:</strong> {conn.user_email}</p>
<p><strong>Age:</strong> {conn.user_age}</p>
<p><strong>Gender:</strong> {conn.user_gender}</p>
<p><strong>Mobile:</strong> {conn.user_mobile}</p>
<p>
<strong>Goals:</strong>{' '}
<span className="client-goals-tag">
{conn.user_goals.split(',').map(goal => goal.trim()).join(', ')}
</span>
</p>
<p className="client-connection-date">
Connected on: {new Date(conn.request_date).toLocaleDateString()} at {new Date(conn.request_date).toLocaleTimeString()}
</p>
<div className="client-card-actions">
<button
onClick={() => handleViewProgress(conn.user_id, conn.user_name)}
className="client-action-button progress-button"
>
<FontAwesomeIcon icon={faChartLine} className="mr-2" />View Progress
</button>
<button
onClick={() => handleCreateDietPlan(conn)}
className="client-action-button diet-button"
>
<FontAwesomeIcon icon={faUtensils} className="mr-2" />Create Diet Plan
</button>
<button
onClick={() => handleCreateWorkoutPlan(conn)}
className="client-action-button workout-button"
>
<FontAwesomeIcon icon={faDumbbell} className="mr-2" />Create Workout Plan
</button>
<button
onClick={() => handleStartChat(conn)}
className="client-action-button chat-button"
>
<FontAwesomeIcon icon={faComment} className="mr-2" />Chat
</button>
</div>
</div>
))}
</div>
)}
{(loadingClientProgress || clientProgressError || viewingClientName) && (
<div className="client-progress-section">
<h3 className="progress-section-title">
<FontAwesomeIcon icon={faChartLine} className="mr-2 text-indigo-600" />
{viewingClientName ? `${viewingClientName}'s Progress` : 'Client Progress'}
</h3>
{loadingClientProgress && (
<div className="dashboard-info-message loading">
<FontAwesomeIcon icon={faSpinner} spin className="message-icon" />
<p className="message-text">Loading progress data...</p>
</div>
)}
{clientProgressError && (
<div className="dashboard-info-message error">
<FontAwesomeIcon icon={faExclamationTriangle} className="message-icon" />
<p className="message-text">Error: {clientProgressError}</p>
<p className="message-tip">Check if client has submitted any progress yet.</p>
</div>
)}
{!loadingClientProgress && !clientProgressError && selectedClientProgress.length === 0 && viewingClientName && (
<div className="dashboard-info-message">
<FontAwesomeIcon icon={faChartLine} className="message-icon" />
<p className="message-text">No progress data found for {viewingClientName}.</p>
<p className="message-tip">Encourage your client to log their activities and metrics!</p>
</div>
)}
{!loadingClientProgress && !clientProgressError && selectedClientProgress.length > 0 && (
<div className="progress-table-container">
<table className="progress-table">
<thead>
<tr>
<th>Date</th>
<th>Weight (kg)</th>
<th>Calories Burned</th>
<th>Workouts Done</th>
</tr>
</thead>
<tbody>
{selectedClientProgress.map((progressEntry, index) => (
<tr key={index}>
<td>{new Date(progressEntry.date).toLocaleDateString()}</td>
<td>{progressEntry.weight}</td>
<td>{progressEntry.calories_burned}</td>
<td>{progressEntry.workouts_done}</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</div>
)}
{showDietPlanModal && (
<DietPlanModal client={selectedClientForPlan} onClose={closeModals} />
)}
{showWorkoutPlanModal && (
<WorkoutPlanModal client={selectedClientForPlan} onClose={closeModals} />
)}
{showChatModal && selectedClientForChat && currentTrainer && (
<div className="plan-modal-overlay">
<div className="plan-modal-content">
<button
onClick={closeModals}
className="plan-modal-close-button"
>
<FontAwesomeIcon icon={faTimes} />
</button>
<h3>Chat with {selectedClientForChat.user_name}</h3>
<Chat
currentUser={{
id: currentTrainer.id.toString(),
name: currentTrainer.full_name,
role: 'trainer',
email: currentTrainer.email
}}
otherUser={{
id: selectedClientForChat.user_id.toString(),
name: selectedClientForChat.user_name,
role: 'user',
email: selectedClientForChat.user_email
}}
/>
</div>
</div>
)}
</div>
);
}
