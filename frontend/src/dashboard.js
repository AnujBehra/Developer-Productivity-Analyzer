import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Tooltip, Cell } from "recharts";

const API_URL = "https://backend-henna-delta-87.vercel.app";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/activity`)
      .then(res => {
        const summary = {};
        res.data.forEach(a => {
          summary[a.type] = (summary[a.type] || 0) + a.duration;
        });

        setData(Object.keys(summary).map(key => ({
          name: key,
          value: summary[key]
        })));
      });
  }, []);

  return (
    <div>
      <h3>Productivity Breakdown</h3>
      <PieChart width={300} height={300}>
        <Pie data={data} dataKey="value" nameKey="name" label>
          {data.map((_, i) => (
            <Cell key={i} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}
