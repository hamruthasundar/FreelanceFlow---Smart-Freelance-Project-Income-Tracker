import React, { useState } from "react";

function Login({ setIsLoggedIn }) {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const loginUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", `Bearer ${data.token}`);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", form.email); // ✅ IMPORTANT
        setIsLoggedIn(true);
      } else {
        alert("Invalid login ❌");
      }

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={container}>
      <div style={box}>
        <h1 style={title}>Welcome Back 💜</h1>
        <p style={subtitle}>Login to track your freelance work</p>

        <input
          placeholder="Email (e.g. you@gmail.com)"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={input}
        />

        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={input}
        />

        <button onClick={loginUser} style={btn}>
          Login 🚀
        </button>
      </div>
    </div>
  );
}

/* STYLES */

const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "linear-gradient(135deg, #a18cd1, #fbc2eb)"
};

const box = {
  background: "#fff",
  padding: "50px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  textAlign: "center",
  width: "350px"
};

const title = {
  marginBottom: "10px",
  fontSize: "28px",
  color: "#6a11cb"
};

const subtitle = {
  marginBottom: "20px",
  color: "#777"
};

const input = {
  display: "block",
  margin: "12px auto",
  padding: "12px",
  width: "100%",
  borderRadius: "8px",
  border: "1px solid #ddd"
};

const btn = {
  marginTop: "15px",
  padding: "12px",
  width: "100%",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer"
};

export default Login;