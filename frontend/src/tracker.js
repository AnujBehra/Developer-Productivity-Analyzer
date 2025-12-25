import axios from "axios";
import { useState } from "react";

const API_URL = "https://backend-henna-delta-87.vercel.app";

export default function Tracker() {
  const [type, setType] = useState("coding");
  const [duration, setDuration] = useState(0);

  const saveActivity = async () => {
    await axios.post(`${API_URL}/api/activity`, {
      type,
      duration
    });
    alert("Activity Logged!");
  };

  return (
    <div>
      <h3>Log Activity</h3>
      <select onChange={e => setType(e.target.value)}>
        <option value="coding">Coding</option>
        <option value="browsing">Browsing</option>
        <option value="break">Break</option>
      </select>

      <input
        type="number"
        placeholder="Minutes"
        onChange={e => setDuration(e.target.value)}
      />

      <button onClick={saveActivity}>Save</button>
    </div>
  );
}
