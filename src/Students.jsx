import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// 🔎 Client-side caste mapping
const CASTE_FIELD_MAP = {
  oc: ['ocBoys', 'ocGirls'],
  bcA: ['bcABoys', 'bcAGirls'],
  bcB: ['bcBBoys', 'bcBGirls'],
  bcC: ['bcCBoys', 'bcCGirls'],
  bcD: ['bcDBoys', 'bcDGirls'],
  bcE: ['bcEBoys', 'bcEGirls'],
  sc: ['scBoys', 'scGirls'],
  st: ['stBoys', 'stGirls'],
  ewsGenOu: ['ewsGenOu'],
  ewsGirlsOu: ['ewsGirlsOu'],
};

// 🔎 Extra Filter Function
const filterStudents = (students, filters) => {
  const { branch, district, caste, minRank, maxRank } = filters;

  const min = Number.isNaN(parseInt(minRank, 10)) ? null : parseInt(minRank, 10);
  const max = Number.isNaN(parseInt(maxRank, 10)) ? null : parseInt(maxRank, 10);
  const fields = caste !== 'All' ? (CASTE_FIELD_MAP[caste] || []) : [];

  return students.filter((s) => {
    if (branch !== 'All' && s.branchCode !== branch) return false;
    if (district !== 'All' && s.distCode !== district) return false;

    if (fields.length === 0) return true; // no caste filter

    // check at least one caste rank within range
    return fields.some((f) => {
      const val = parseInt(s[f], 10);
      if (Number.isNaN(val)) return false;
      if (min !== null && val < min) return false;
      if (max !== null && val > max) return false;
      return true;
    });
  });
};

// Main App component
const App = () => {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filters, setFilters] = useState({
    branch: 'All',
    district: 'All',
    caste: 'All',
    minRank: '',
    maxRank: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example dropdown data
  useEffect(() => {
    setBranches(['All', 'CSE', 'ECE', 'IT', 'MECH']);
    setDistricts(['All', 'HYD', 'RR', 'MDL', 'KHM']);
  }, []);

  // Fetch students from backend
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/students`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      // ✅ apply filter function on client-side
      const filtered = filterStudents(data, filters);
      setStudents(filtered);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // re-fetch and filter whenever filters change
  useEffect(() => {
    fetchStudents();
  }, [filters]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const castes = ['All', 'oc', 'bcA', 'bcB', 'bcC', 'bcD', 'bcE', 'sc', 'st', 'ewsGenOu', 'ewsGirlsOu'];

  const tableHeaders = [
    { key: 'instCode', label: 'Inst. Code' },
    { key: 'instituteName', label: 'Institute Name' },
    { key: 'branchCode', label: 'Branch' },
    { key: 'distCode', label: 'District' },
    { key: 'ocBoys', label: 'OC Boys Rank' },
    { key: 'ocGirls', label: 'OC Girls Rank' },
    { key: 'tuitionFee', label: 'Tuition Fee' },
  ];

  return (
    <div className="bg-gray-100 p-8 min-h-screen font-sans text-lg">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Campus Information
        </h1>

        {/* Filter Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10 text-lg">
          {/* Branch Filter */}
          <select name="branch" value={filters.branch} onChange={handleInputChange}
            className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg">
            <option value="All">-- Select Branch --</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          {/* District Filter */}
          <select name="district" value={filters.district} onChange={handleInputChange}
            className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg">
            <option value="All">-- Select District --</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Caste Filter */}
          <select name="caste" value={filters.caste} onChange={handleInputChange}
            className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg">
            <option value="All">-- Select Caste --</option>
            {castes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Min Rank Input */}
          <input type="number" name="minRank" placeholder="Min Rank"
            value={filters.minRank} onChange={handleInputChange}
            className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" />

          {/* Max Rank Input */}
          <input type="number" name="maxRank" placeholder="Max Rank"
            value={filters.maxRank} onChange={handleInputChange}
            className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" />
        </div>

        {/* Student Table */}
        {loading && <div className="text-center text-gray-600 text-xl">Loading...</div>}
        {error && <div className="text-center text-red-500 text-xl">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full bg-white border-collapse text-lg">
              <thead>
                <tr className="bg-blue-600 text-white text-left text-lg">
                  {tableHeaders.map(header => (
                    <th key={header.key} className="py-4 px-6 uppercase font-semibold">
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      {tableHeaders.map(header => (
                        <td key={header.key} className="py-4 px-6 text-gray-700">
                          {student[header.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-10 text-gray-500 text-xl">
                      No results found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Mount App
const container = document.getElementById('react-app-root');
const root = createRoot(container);
root.render(<App />);

export default App;
