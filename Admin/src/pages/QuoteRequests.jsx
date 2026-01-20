import React, { useState } from 'react';
import { Eye, CheckCircle, Trash2 } from 'lucide-react';

const QuoteRequests = () => {
  const [quotes, setQuotes] = useState([]);

  const handleDelete = (id) => {
    if(window.confirm('Delete this quote request?')) {
        setQuotes(quotes.filter(q => q.id !== id));
    }
  };

  const handleMarkDone = (id) => {
      setQuotes(quotes.map(q => q.id === id ? {...q, status: 'Contacted'} : q));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Quote Requests</h1>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Budget / Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Preference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{q.name}</div>
                      <div className="text-sm text-slate-500">{q.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-semibold">{q.projectName}</div>
                      <div className="text-xs text-slate-500">{q.projectType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">B: <span className="font-medium text-slate-700">{q.budget}</span></div>
                      <div className="text-sm text-slate-500">T: <span className="font-medium text-slate-700">{q.timeline}</span></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{q.followUp}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${q.status === 'Contacted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {q.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3" title="View"><Eye size={18} /></button>
                    <button onClick={() => handleMarkDone(q.id)} className="text-green-600 hover:text-green-900 mr-3" title="Mark Contacted"><CheckCircle size={18} /></button>
                    <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequests;
