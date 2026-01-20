import React from 'react';
import { Users, FileText, PhoneCall, HelpCircle, ArrowUpRight } from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-full ${color.bg} ${color.text}`}>
        <Icon size={24} />
      </div>
      {trend && (
         <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
             <ArrowUpRight size={14} className="mr-1" /> {trend}
         </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-800 mt-1">{count}</p>
  </div>
);

const Dashboard = () => {
  // Mock Data replaced with empty/zero defaults
  const stats = [
    { title: 'Total Service Leads', count: 0, icon: Users, color: { bg: 'bg-blue-50', text: 'text-blue-600' }, trend: '0%' },
    { title: 'Quote Requests', count: 0, icon: FileText, color: { bg: 'bg-purple-50', text: 'text-purple-600' }, trend: '0%' },
    { title: 'Expert Calls', count: 0, icon: PhoneCall, color: { bg: 'bg-green-50', text: 'text-green-600' }, trend: '0%' },
    { title: 'Support Tickets', count: 0, icon: HelpCircle, color: { bg: 'bg-orange-50', text: 'text-orange-600' }, trend: '0%' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Leads</h3>
              <div className="space-y-4">
                 <p className="text-slate-400 text-sm">No recent leads found.</p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Pending Quotes</h3>
              <div className="space-y-4">
                 <p className="text-slate-400 text-sm">No pending quotes found.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
