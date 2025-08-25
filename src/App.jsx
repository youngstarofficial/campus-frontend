import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function App() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    branch: "",
    district: "",
    caste: "",
    minRank: "",
    maxRank: "",
  });

  const [studentInfo, setStudentInfo] = useState({
    name: "",
    rank: "",
    caste: "",
  });

  const [showApp, setShowApp] = useState(false);

  const filterOptions = {
    branches: [
      "CIV","CSE","ECE","MEC","CSD","CSM","EEE","INF","PHM","AGR","AIM",
      "MIN","PET","EIE","CAD","AID","AUT","CSC","COS","CAI","DS","ECA","EVT",
      "FDE","CHE","PEE","PHE","PHD","CS","CIT","CSG","CSB","CSO","CIC","CBA",
      "EII","IOT","ASE","CSER","AI","CSEB","BIO","GIN","IST","MET","NAM","MRB",
      "ECM","CSS","CST","ECT","RBT","FDT","CSN","CCC","CIA","EBM","CN","CSBS",
      "CSW","MMM","BDT","SWE","GDT"
    ],
    districts: [
      "HYD","MDL","RR","KGM","SRP","WGL","KHM","MED","SRD","KMR","NZB","SDP",
      "JTL","MHB","PDL","SRC","WNP","MBN","HNK","NLG","YBG"
    ],
    categories: [
      "OC Boys","OC Girls","BC-A Boys","BC-A Girls","BC-B Boys","BC-B Girls",
      "BC-C Boys","BC-C Girls","BC-D Boys","BC-D Girls","BC-E Boys","BC-E Girls",
      "SC Boys","SC Girls","ST Boys","ST Girls","EWS GEN OU","EWS Girls OU"
    ],
  };

  const casteFieldMap = {
    "OC Boys": "ocBoys",
    "OC Girls": "ocGirls",
    "BC-A Boys": "bcABoys",
    "BC-A Girls": "bcAGirls",
    "BC-B Boys": "bcBBoys",
    "BC-B Girls": "bcBGirls",
    "BC-C Boys": "bcCBoys",
    "BC-C Girls": "bcCGirls",
    "BC-D Boys": "bcDBoys",
    "BC-D Girls": "bcDGirls",
    "BC-E Boys": "bcEBoys",
    "BC-E Girls": "bcEGirls",
    "SC Boys": "scBoys",
    "SC Girls": "scGirls",
    "ST Boys": "stBoys",
    "ST Girls": "stGirls",
    "EWS GEN OU": "ewsGenOu",
    "EWS Girls OU": "ewsGirlsOu",
  };

  // ✅ Fetch students from backend
  const fetchStudents = async () => {
    try {
      console.log("🔎 Sending filters:", filters);
      const res = await axios.get("http://localhost:5000/students", { params: filters });

      console.log("✅ Response received:", res.data.length);

      // Remove duplicates if any (by _id)
      const uniqueStudents = Array.from(
        new Map(res.data.map(s => [s._id, s])).values()
      );

      // ✅ Sort alphabetically by instCode instead of instituteName
      const sortedStudents = uniqueStudents.sort((a, b) =>
        (a.instCode || "").localeCompare(b.instCode || "", undefined, { sensitivity: "base" })
      );

      setStudents(sortedStudents);
    } catch (err) {
      console.error("❌ Error fetching students:", err.response ? err.response.data : err.message);
    }
  };

  useEffect(() => {
    if (showApp) fetchStudents();
  }, [showApp]);

  const downloadPDF = () => {
    if (students.length === 0) {
      alert("No data to export");
      return;
    }

    const isSingleCaste = filters.caste !== "";
    const doc = new jsPDF("l", "pt", isSingleCaste ? "a4" : "a3");

    doc.setFontSize(16);
    doc.text("Students Data", 40, 30);

    doc.setFontSize(12);
    doc.text(`Name: ${studentInfo.name || "-"}`, 40, 50);
    doc.text(`Rank: ${studentInfo.rank || "-"}`, 200, 50);
    doc.text(`Caste: ${studentInfo.caste || "-"}`, 350, 50);

    const basicColumns = ["Inst Code", "Institute", "Branch", "District"];
    const casteColumn = isSingleCaste ? [filters.caste] : Object.keys(casteFieldMap);
    const tableColumn = [...basicColumns, ...casteColumn];

    const tableRows = students.map((s) => {
      const row = [s.instCode || "", s.instituteName || "", s.branchCode || "", s.distCode || ""];
      if (isSingleCaste) row.push(s[casteFieldMap[filters.caste]] || "");
      else row.push(
        s.ocBoys, s.ocGirls, s.bcABoys, s.bcAGirls, s.bcBBoys, s.bcBGirls,
        s.bcCBoys, s.bcCGirls, s.bcDBoys, s.bcDGirls, s.bcEBoys, s.bcEGirls,
        s.scBoys, s.scGirls, s.stBoys, s.stGirls, s.ewsGenOu, s.ewsGirlsOu
      );
      return row;
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      styles: { fontSize: 11, cellPadding: 6, minCellHeight: 20, valign: "middle" },
      headStyles: { fillColor: [30, 30, 120], textColor: 255, fontSize: 12, halign: "center" },
      bodyStyles: { halign: "center" },
      margin: { top: 50, left: 20, right: 20 },
      theme: "grid",
      tableWidth: "auto",
    });

    doc.save("students.pdf");
  };

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const resetFilters = () => {
    setFilters({ branch: "", district: "", caste: "", minRank: "", maxRank: "" });
    fetchStudents();
  };

  if (!showApp) {
    return (
      <div style={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: "#222", color: "white", textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: "60px", marginBottom: "20px" }}>🎓 Welcome 😎</h1>
          <p style={{ fontSize: "24px", marginBottom: "30px" }}>RMR presents ❤️</p>
          <button onClick={() => setShowApp(true)} style={{ padding: "15px 40px", fontSize: "22px", fontWeight: "bold", cursor: "pointer", background: "teal", color: "white", border: "none", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.4)" }}>🚀 Open</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Students Data</h2>

      {/* Student Info */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid gray" }}>
        <h3>Enter Student Info</h3>
        <input type="text" name="name" placeholder="Student Name" value={studentInfo.name} onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })} style={{ marginRight: "10px" }} />
        <input type="number" name="rank" placeholder="Rank" value={studentInfo.rank} onChange={(e) => setStudentInfo({ ...studentInfo, rank: e.target.value })} style={{ marginRight: "10px" }} />
        <select name="caste" value={studentInfo.caste} onChange={(e) => setStudentInfo({ ...studentInfo, caste: e.target.value })} style={{ marginRight: "10px" }}>
          <option value="">-- Select Caste --</option>
          {filterOptions.categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <select name="branch" value={filters.branch} onChange={handleChange} style={{ marginRight: "10px" }}>
          <option value="">-- Select Branch --</option>
          {filterOptions.branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
        </select>
        <select name="district" value={filters.district} onChange={handleChange} style={{ marginRight: "10px" }}>
          <option value="">-- Select District --</option>
          {filterOptions.districts.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>
        <select name="caste" value={filters.caste} onChange={handleChange} style={{ marginRight: "10px" }}>
          <option value="">-- Select Caste --</option>
          {filterOptions.categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>
        <input type="number" name="minRank" placeholder="Min Rank" value={filters.minRank} onChange={handleChange} style={{ marginRight: "10px" }} />
        <input type="number" name="maxRank" placeholder="Max Rank" value={filters.maxRank} onChange={handleChange} style={{ marginRight: "10px" }} />
        <button onClick={fetchStudents} style={{ marginRight: "10px" }}>Search</button>
        <button onClick={resetFilters} style={{ marginRight: "10px" }}>Reset</button>
        <button onClick={downloadPDF}>Download as PDF</button>
      </div>

      {/* Results Table */}
      <table border="1" cellPadding="8" style={{ marginTop: "20px", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr>
            <th>Inst Code</th>
            <th>Institute</th>
            <th>Branch</th>
            <th>District</th>
            {filters.caste ? <th>{filters.caste}</th> : Object.keys(casteFieldMap).map((c, i) => <th key={i}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i}>
              <td>{s.instCode}</td>
              <td>{s.instituteName}</td>
              <td>{s.branchCode}</td>
              <td>{s.distCode}</td>
              {filters.caste ? (
                <td>{s[casteFieldMap[filters.caste]]}</td>
              ) : (
                <>
                  <td>{s.ocBoys}</td><td>{s.ocGirls}</td><td>{s.bcABoys}</td><td>{s.bcAGirls}</td>
                  <td>{s.bcBBoys}</td><td>{s.bcBGirls}</td><td>{s.bcCBoys}</td><td>{s.bcCGirls}</td>
                  <td>{s.bcDBoys}</td><td>{s.bcDGirls}</td><td>{s.bcEBoys}</td><td>{s.bcEGirls}</td>
                  <td>{s.scBoys}</td><td>{s.scGirls}</td><td>{s.stBoys}</td><td>{s.stGirls}</td>
                  <td>{s.ewsGenOu}</td><td>{s.ewsGirlsOu}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
