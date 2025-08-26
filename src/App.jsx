import React, { useState } from "react";
import axios from "axios";

function App() {
  const [filters, setFilters] = useState({
    branch: "",
    district: "",
    caste: "",
    minRank: "",
    maxRank: "",
  });
  const [students, setStudents] = useState([]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchStudents = async () => {
    try {
      console.log("🔎 Sending filters:", filters);

      // ✅ Convert branch, district, caste to uppercase for consistency
      const params = {
        branch: filters.branch ? filters.branch.toUpperCase() : "",
        district: filters.district ? filters.district.toUpperCase() : "",
        caste: filters.caste ? filters.caste.toUpperCase() : "",
        minRank: filters.minRank,
        maxRank: filters.maxRank,
      };

      // 🔹 Use Render backend instead of localhost
      const res = await axios.get("https://campus-api-1.onrender.com/students", {
        params,
      });

      console.log("✅ Response received:", res.data.length);

      // Remove duplicates (by _id)
      const uniqueStudents = Array.from(
        new Map(res.data.map((s) => [s._id, s])).values()
      );

      // Sort alphabetically by instCode
      const sortedStudents = uniqueStudents.sort((a, b) =>
        (a.instCode || "").localeCompare(b.instCode || "", undefined, {
          sensitivity: "base",
        })
      );

      setStudents(sortedStudents);
    } catch (err) {
      console.error(
        "❌ Error fetching students:",
        err.response ? err.response.data : err.message
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Campus Students</h1>

      <div style={{ marginBottom: "10px" }}>
        <input
          name="branch"
          placeholder="Branch Code (CSE, EEE)"
          value={filters.branch}
          onChange={handleChange}
        />
        <input
          name="district"
          placeholder="District Code (HYD, KHM)"
          value={filters.district}
          onChange={handleChange}
        />
        <input
          name="caste"
          placeholder="Caste (OC BOYS, SC GIRLS...)"
          value={filters.caste}
          onChange={handleChange}
        />
        <input
          name="minRank"
          placeholder="Min Rank"
          value={filters.minRank}
          onChange={handleChange}
        />
        <input
          name="maxRank"
          placeholder="Max Rank"
          value={filters.maxRank}
          onChange={handleChange}
        />
        <button onClick={fetchStudents}>Search</button>
      </div>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Institute Code</th>
            <th>Institute Name</th>
            <th>Branch Code</th>
            <th>District</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={s._id}>
                <td>{s.instCode}</td>
                <td>{s.instituteName}</td> {/* ✅ FIXED */}
                <td>{s.branchCode}</td>
                <td>{s.distCode}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No results found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
