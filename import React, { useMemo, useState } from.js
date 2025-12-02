import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const rawCsv = `2025-10-01 00:00:00,Living Room,TV,89
2025-10-01 00:00:00,Living Room,Lamp,14
2025-10-01 00:00:00,Living Room,AC,1397
2025-10-01 00:00:00,Kitchen,Refrigerator,163
2025-10-01 00:00:00,Kitchen,Oven,2097
2025-10-01 00:00:00,Kitchen,Microwave,893
2025-10-01 00:00:00,Bedroom,Lamp,22
2025-10-01 00:00:00,Bedroom,Fan,55
2025-10-01 00:00:00,Bedroom,TV,143
2025-10-01 00:00:00,Bedroom,PlayStation,109
2025-10-01 00:00:00,Garage,Dryer,2039
2025-10-01 00:00:00,Garage,Washer,944`;

function parseCsv(csv) {
  const lines = csv.split("\n").filter((l) => l.trim().length);
  return lines.map((line) => {
    const [timestamp, room, device, watts] = line.split(",").map((p) => p.trim());
    return {
      timestamp,
      timeISO: timestamp,
      room,
      device,
      watts: Number(watts),
    };
  });
}

function aggregateByDevice(rows) {
  const map = new Map();
  rows.forEach((r) => map.set(r.device, (map.get(r.device) || 0) + r.watts));
  return Array.from(map.entries()).map(([device, watts]) => ({ device, watts }));
}

function aggregateByRoom(rows) {
  const map = new Map();
  rows.forEach((r) => map.set(r.room, (map.get(r.room) || 0) + r.watts));
  return Array.from(map.entries()).map(([room, watts]) => ({ room, watts }));
}

function timelineByTimestamp(rows) {
  const map = new Map();
  rows.forEach((r) => {
    const t = r.timestamp;
    const entry = map.get(t) || { timestamp: t };
    entry.total = (entry.total || 0) + r.watts;
    map.set(t, entry);
  });
  return Array.from(map.values());
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57"]; 

export default function EnergyDashboardFixed() {
  const [rawText, setRawText] = useState(rawCsv);

  const rows = useMemo(() => parseCsv(rawText), [rawText]);
  const byDevice = useMemo(() => aggregateByDevice(rows), [rows]);
  const byRoom = useMemo(() => aggregateByRoom(rows), [rows]);
  const timeline = useMemo(() => timelineByTimestamp(rows), [rows]);

  const totalWatts = rows.reduce((sum, r) => sum + r.watts, 0);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Smart Home Energy Dashboard</h1>
          <span>Total Energy: {totalWatts.toLocaleString()} W</span>
        </header>

        {/* Timeline Chart */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-medium mb-2">Energy Over Time</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(t) => t.split(" ")[1]} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Bar Chart */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-medium mb-2">Energy Use by Device</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={byDevice}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="watts">
                  {byDevice.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Pie Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-medium mb-2">Energy Use by Room</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byRoom} dataKey="watts" nameKey="room" outerRadius={110} label>
                  {byRoom.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
