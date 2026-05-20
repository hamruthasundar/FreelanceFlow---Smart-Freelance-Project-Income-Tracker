import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";


function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [activeChart, setActiveChart] = useState("pie"); // ✅ fixed
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
  clientName: "",
  title: "",
  budget: "",
  deadline: ""
});

  useEffect(() => {
    fetchProjects();

    const storedName = localStorage.getItem("name");
    if (storedName) setUserName(storedName);
    else {
      const email = localStorage.getItem("email");
      if (email) {
        const n = email.split("@")[0];
        setUserName(n.charAt(0).toUpperCase() + n.slice(1));
      }
    }
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("http://localhost:5000/projects", {
      headers: { Authorization: localStorage.getItem("token") }
    });
    const data = await res.json();
    setProjects(data);
  };

  const addProject = async () => {
    if (!form.clientName || !form.title || !form.budget) {
      toast.error("Fill all fields");
      return;
    }

    await fetch("http://localhost:5000/add-project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({ ...form, budget: Number(form.budget) })
    });

    toast.success("Project Added 🚀");
    setShowForm(false);
    setForm({ clientName: "", title: "", budget: "" });
    fetchProjects();
  };

const updateProject = async () => {
  if (!form.clientName || !form.title || !form.budget) {
    toast.error("Fill all fields 😤");
    return;
  }

  await fetch(`http://localhost:5000/edit-project/${editId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token")
    },
    body: JSON.stringify({
      ...form,
      budget: Number(form.budget),
      deadline: form.deadline
    })
  });

  toast.success("Project Updated ✏️");

  setEditId(null);
  setShowForm(false);
  setForm({ clientName: "", title: "", budget: "", deadline: "" });

  fetchProjects();
};

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    await fetch(`http://localhost:5000/delete-project/${id}`, {
      method: "DELETE",
      headers: { Authorization: localStorage.getItem("token") }
    });

    toast.success("Deleted 🗑️");
    fetchProjects();
  };

  const markDone = async (id) => {
    await fetch(`http://localhost:5000/update-project/${id}`, {
      method: "PUT",
      headers: { Authorization: localStorage.getItem("token") }
    });

    toast.success("Completed ✅");
    fetchProjects();
  };

  const filtered = projects.filter(p => {
    if (filter === "completed") return p.status === "completed";
    if (filter === "ongoing") return p.status === "ongoing";
    return true;
  });

  const total = projects.length;
  const completed = projects.filter(p => p.status === "completed").length;
  const ongoing = total - completed;
  const income = projects.reduce((sum, p) => sum + p.budget, 0);

  const chartData = [
    { name: "Completed", value: completed },
    { name: "Ongoing", value: ongoing }
  ];

  // 📊 BAR CHART DATA (Income per client)
const clientDataMap = {};
projects.forEach(p => {
  if (!clientDataMap[p.clientName]) {
    clientDataMap[p.clientName] = 0;
  }
  clientDataMap[p.clientName] += p.budget;
});

const barData = Object.keys(clientDataMap).map(client => ({
  client,
  income: clientDataMap[client]
}));

// 📈 LINE CHART DATA (Simple earnings trend)
const deadlineData = projects.map((p, index) => {
  const today = new Date();
  const deadline = new Date(p.deadline);

  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    name: `P${index + 1}`,
    daysLeft: diffDays
  };
});

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const renderCustomizedLabel = ({ percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

return (
  <text
    x={x}
    y={y}
    fill="#222"
    textAnchor="middle"
    dominantBaseline="central"
    fontSize="14"
    fontWeight="bold"
  >
    {(percent * 100).toFixed(0)}%
  </text>
);
};   

return (
  <div style={container}>
    <ToastContainer />

    {/* NAVBAR */}
    <div style={navbar}>
      <button style={navBtn} onClick={() => setActivePage("home")}>Home</button>
      <button style={navBtn} onClick={() => setActivePage("analytics")}>Analytics</button>
      <button style={navBtn} onClick={() => setActivePage("clients")}>Clients</button>
      <button style={navBtn} onClick={() => setActivePage("profile")}>Profile</button>
    </div>

    {/* HEADER */}
    <div style={header}>
      <h2>Welcome, {userName || "User"} 👋</h2>

      <div style={{ position: "relative" }}>
        <button style={profileBtn} onClick={() => setShowProfile(!showProfile)}>
          👤
        </button>

        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={dropdown}
          >
            <p>{userName}</p>
            <button onClick={logout} style={logoutBtn}>Logout</button>
          </motion.div>
        )}
      </div>
    </div>

    {/* HOME */}
    {activePage === "home" && (
      <>
        {/* STATS */}
        <div style={statsContainer}>
          <StatCard title="Total Projects" value={total} />
          <StatCard title="Completed" value={completed} />
          <StatCard title="Ongoing" value={ongoing} />
          <StatCard title="Total Income" value={`₹${income}`} />
        </div>

        {/* FILTER */}
        <div style={filters}>
          <button onClick={() => setFilter("all")} style={filterBtn}>All</button>
          <button onClick={() => setFilter("completed")} style={filterBtn}>Completed</button>
          <button onClick={() => setFilter("ongoing")} style={filterBtn}>Ongoing</button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "center" }}>
          <button onClick={() => setActiveChart("pie")} style={filterBtn}>Pie</button>
          <button onClick={() => setActiveChart("bar")} style={filterBtn}>Bar</button>
          <button onClick={() => setActiveChart("line")} style={filterBtn}>Line</button>
        </div>
        {/* CHART */}
<div style={chartSection}>
  <div style={divider}></div>

  <div style={chartBox}>

    {activeChart === "pie" && (
      <PieChart width={300} height={250}>
        <Pie
          data={chartData}
          dataKey="value"
          outerRadius={80}
          label={renderCustomizedLabel}
          labelLine={false}
        >
          <Cell fill="#235c25" />
          <Cell fill="#6b4b1c" />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    )}

    {activeChart === "bar" && (
      <BarChart width={350} height={250} data={barData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="client" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="#8884d8" />
      </BarChart>
    )}

    {activeChart === "line" && (
      <LineChart width={350} height={250} data={deadlineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="daysLeft" stroke="#ff7300" />
      </LineChart>
    )}

  </div>

  <div style={divider}></div>
</div>
        {/* ADD BUTTON */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          style={addBtn}
          onClick={() => setShowForm(true)}
        >
          + Add Project
        </motion.button>

        {/* ✅ FORM (MOVED OUTSIDE BUTTON — THIS IS THE MAIN FIX) */}
        {showForm && (
          <div style={overlay}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={popup}>
              <h3>{editId ? "Edit Project" : "Add Project"}</h3>
              <label style={label}>Client Name</label>
              <input
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                style={input}
              />

              <label style={label}>Project Name</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={input}
              />

              <label style={label}>Amount</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                style={input}
              />

            <label style={label}>Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              style={input}
            />
              <button 
              style={btn} 
              onClick={editId ? updateProject : addProject}
            >
              {editId ? "Update" : "Add"}
            </button>
            <button style={cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </motion.div>
          </div>
        )}

        {/* PROJECTS */}
        <div style={grid}>
          {filtered.map((p, i) => (
            <motion.div
              key={p._id ? p._id : i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={card}
            >
              <h3>{p.title}</h3>
              <p>{p.clientName}</p>
              <p>₹{p.budget}</p>

              {p.status === "ongoing" &&
                <button style={btn} onClick={() => markDone(p._id)}>Done</button>
              }

              <p style={{
                color: p.status === "completed" ? "limegreen" : "orange",
                fontWeight: "bold"
              }}>
                {p.status.toUpperCase()}
              </p>

              <button style={deleteBtn} onClick={() => deleteProject(p._id)}>Delete</button>
              <button
                style={btn}
                onClick={() => {
                  setForm({
                    clientName: p.clientName,
                    title: p.title,
                    budget: p.budget,
                    deadline: p.deadline ? p.deadline.split("T")[0] : ""
                  });
                  setEditId(p._id);
                  setShowForm(true);
                }}
              >
  Edit ✏️
</button>
            </motion.div>
          ))}
        </div>
      </>
    )}

    {/* CLIENTS */}
    {activePage === "clients" && (
      <div style={sectionBox}>
        <h2>Clients Waiting</h2>
        <p>• Client A - Website Project</p>
        <p>• Client B - App Development</p>
        <p>• Client C - UI Design</p>
      </div>
    )}

    {/* PROFILE */}
    {activePage === "profile" && (
      <div style={sectionBox}>
        <h2>Profile Info</h2>
        <p>Name: {userName}</p>
        <p>Start Date: Jan 2025</p>
        <p>Status: Active Freelancer</p>
      </div>
    )}

    {/* ANALYTICS */}
    {activePage === "analytics" && (
      <div style={sectionBox}>
        <h2>Analytics</h2>
        <p>Total Projects: {total}</p>
        <p>Completed: {completed}</p>
        <p>Ongoing: {ongoing}</p>
        <p>Total Income: ₹{income}</p>
      </div>
    )}
  </div>
);

  };
/* STAT CARD */
const StatCard = ({ title, value }) => (
  <motion.div
    whileHover={{
      scale: 1.05,
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    }}
    style={statCard}
  >
    <h4 style={{ fontSize: "16px", opacity: 0.8 }}>{title}</h4>
<h2 style={{ fontSize: "28px", marginTop: "5px" }}>{value}</h2>
  </motion.div>
);

/* STYLES */
const container = {
  padding: "30px",
  background: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  color: "#000000",
  minHeight: "100vh"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "relative",
  zIndex: 1000
};

const profileBtn = {
  fontSize: "20px",
  padding: "10px",
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
  background: "rgba(255,255,255,0.2)",
  backdropFilter: "blur(5px)"
};

const dropdown = {
  position: "absolute",
  right: 0,
  top: "50px",
  background: "#fff",
  color: "#000",
  padding: "15px",
  borderRadius: "12px",
  zIndex: 9999,
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  minWidth: "120px"
};

const logoutBtn = {
  background: "red",
  color: "#fff",
  border: "none",
  padding: "6px"
};

const statsContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)", // 👈 2 per row
  gap: "20px",
  marginTop: "25px"
};

const statCard = {
  background: "rgba(255,255,255,0.15)",
  padding: "25px", // 👈 bigger
  borderRadius: "14px",
  backdropFilter: "blur(12px)",
  cursor: "pointer",
  transition: "0.3s",
  border: "1px solid rgba(255,255,255,0.4)" // 👈 added border
};

const filters = { marginTop: "20px" };
const filterBtn = { marginRight: "10px", padding: "8px" };

const chartBox = {
  marginTop: "20px",
  display: "flex",
  justifyContent: "center"
};

const addBtn = {
  marginTop: "20px",
  padding: "10px",
  background: "#4CAF50",
  border: "none",
  color: "#fff"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: "15px",
  marginTop: "20px"
};

const card = {
  background: "rgba(255,255,255,0.1)",
  padding: "15px",
  borderRadius: "10px",
  backdropFilter: "blur(10px)"
};

const btn = {
  marginTop: "10px",
  padding: "6px"
};

const deleteBtn = {
  marginTop: "10px",
  background: "red",
  color: "#fff",
  border: "none",
  padding: "6px"
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999   // 🔥 ADD THIS LINE
};

const popup = {
  background: "#fff",
  color: "#000",
  padding: "20px",
  borderRadius: "10px",
  zIndex: 10000
};

const input = {
  display: "block",
  margin: "10px 0",
  padding: "8px"
};

const label = {
  fontSize: "14px",
  marginTop: "10px",
  display: "block",
  fontWeight: "bold"
};

const cancelBtn = {
  background: "#ccc",
  border: "none",
  padding: "6px 10px",
  cursor: "pointer",
  borderRadius: "5px"
};

const chartSection = {
  marginTop: "25px",
  marginBottom: "10px"
};

const divider = {
  height: "2px",
  width: "100%",
  background: "rgba(255,255,255,0.3)",
  margin: "15px 0"
};

const navbar = {
  display: "flex",
  gap: "12px",
  marginBottom: "20px"
};

const navBtn = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.5)",
  background: "rgba(255,255,255,0.2)",
  cursor: "pointer",
  fontWeight: "bold"
};

const sectionBox = {
  marginTop: "20px",
  padding: "20px",
  background: "rgba(255,255,255,0.2)",
  borderRadius: "12px",
  backdropFilter: "blur(10px)"
};
export default Dashboard;