import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, RefreshCw } from 'lucide-react';

// Use relative path to leverage Vite Proxy (bypassing CORS)
const API_BASE_URL = "/api";

const ServiceLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    setErrorDetails(null);
    try {
      // Fetching leads with pagination params as standard convention
      const response = await fetch(`${API_BASE_URL}/Leads/GetAllPage?start=0&length=100&sortColumnDir=desc`, {
          headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Leads Data:", data);

      let list = [];
      // Handle various response structures
      if (data.data && Array.isArray(data.data)) list = data.data; // Standard wrapped
      else if (data.data && data.data.data && Array.isArray(data.data.data)) list = data.data.data; // Nested wrapped
      else if (Array.isArray(data)) list = data; // Direct array

      setLeads(list);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setErrorDetails(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = (id) => {
      // Implement API delete if needed, for now just local state
      if(window.confirm('Are you sure you want to delete this lead?')) {
          setLeads(leads.filter(l => l.leadId !== id && l.id !== id));
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Service Leads</h1>
        <div className="flex gap-2">
            <button onClick={fetchLeads} className="bg-slate-100 text-slate-700 p-2 rounded hover:bg-slate-200 transition-colors">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium">Export CSV</button>
        </div>
      </div>

      {errorDetails && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error Loading Data: </strong>
              <span className="block sm:inline">{errorDetails}</span>
              <div className="mt-2 text-sm text-red-600">
                  Possible Fixes:
                  <ul className="list-disc ml-5">
                      <li>Ensure backend API (https://localhost:7228) is running.</li>
                      <li><strong>Important:</strong> Restart this Admin Panel server (`npm run dev`) to apply proxy settings.</li>
                  </ul>
              </div>
          </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">LeadId</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CreatedBy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CreatedDate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SubService</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Platform Opation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                  <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-slate-500">Loading leads...</td>
                  </tr>
              ) : leads.length === 0 ? (
                  <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-slate-500">No leads found.</td>
                  </tr>
              ) : (
                  leads.map((lead) => (
                    <tr key={lead.leadId || lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{lead.leadId || lead.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{lead.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.createdBy || 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {lead.createdDate ? new Date(lead.createdDate).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                           {lead.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                           {lead.subService}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                           {lead.platformOpation ?? lead.platformOption}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceLeads;
