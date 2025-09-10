import { useEffect, useState } from "react";

export default function ProfileSettings() {
  const [profile, setProfile] = useState({ full_name: "", phone: "", age: "", gender: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProfile(data);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5050/api/user/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (res.ok) alert("Profile updated");
    else alert("Error: " + data.message);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow rounded max-w-lg mx-auto space-y-4">
      <h2 className="text-xl font-bold">Edit Profile</h2>
      <input type="text" name="full_name" value={profile.full_name} onChange={handleChange} placeholder="Full Name" className="w-full border p-2 rounded" />
      <input type="text" name="phone" value={profile.phone} onChange={handleChange} placeholder="Phone" className="w-full border p-2 rounded" />
      <input type="number" name="age" value={profile.age} onChange={handleChange} placeholder="Age" className="w-full border p-2 rounded" />
      <select name="gender" value={profile.gender} onChange={handleChange} className="w-full border p-2 rounded">
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
    </form>
  );
}
