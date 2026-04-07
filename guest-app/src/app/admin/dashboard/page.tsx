'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  // Revenue data for line chart
  const revenueData = [
    { month: 'Jan', revenue: 45000, orders: 120 },
    { month: 'Feb', revenue: 52000, orders: 145 },
    { month: 'Mar', revenue: 48000, orders: 132 },
    { month: 'Apr', revenue: 61000, orders: 168 },
    { month: 'May', revenue: 55000, orders: 152 },
    { month: 'Jun', revenue: 67000, orders: 189 },
  ];

  // Service distribution data
  const serviceData = [
    { name: 'Room Cleaning', value: 145, color: '#93C572' },
    { name: 'Laundry', value: 89, color: '#7AB55E' },
    { name: 'Maintenance', value: 56, color: '#5F9147' },
    { name: 'Towel & Linens', value: 123, color: '#A8E5A8' },
  ];

  // Daily orders data
  const dailyOrdersData = [
    { day: 'Mon', breakfast: 45, lunch: 67, dinner: 89 },
    { day: 'Tue', breakfast: 52, lunch: 73, dinner: 95 },
    { day: 'Wed', breakfast: 48, lunch: 69, dinner: 87 },
    { day: 'Thu', breakfast: 61, lunch: 82, dinner: 103 },
    { day: 'Fri', breakfast: 58, lunch: 78, dinner: 98 },
    { day: 'Sat', breakfast: 72, lunch: 95, dinner: 118 },
    { day: 'Sun', breakfast: 68, lunch: 91, dinner: 112 },
  ];

  // Stats data
  const stats = [
    { label: 'Total Revenue', value: '₹3,28,000', change: '+12.5%', icon: '💰', color: 'from-green-500 to-green-600' },
    { label: 'Total Orders', value: '906', change: '+8.2%', icon: '🛒', color: 'from-blue-500 to-blue-600' },
    { label: 'Active Rooms', value: '87', change: '+5.1%', icon: '🛏️', color: 'from-purple-500 to-purple-600' },
    { label: 'Service Requests', value: '413', change: '+15.3%', icon: '🧹', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-pista-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-effect border-2 border-pista-200 rounded-xl p-5 hover:shadow-xl transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-pista-600 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-pista-900 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 font-semibold mt-1">{stat.change}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
            <div className={`h-1 w-full bg-gradient-to-r ${stat.color} rounded-full`}></div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-pista-900 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F9E8" />
              <XAxis dataKey="month" stroke="#5F9147" />
              <YAxis stroke="#5F9147" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#F5FDF5', border: '2px solid #93C572', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#93C572" strokeWidth={3} name="Revenue (₹)" />
              <Line type="monotone" dataKey="orders" stroke="#7AB55E" strokeWidth={3} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Service Distribution */}
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-pista-900 mb-4">Service Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Orders Chart */}
      <div className="glass-effect border-2 border-pista-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-pista-900 mb-4">Daily Orders by Meal</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dailyOrdersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8F9E8" />
            <XAxis dataKey="day" stroke="#5F9147" />
            <YAxis stroke="#5F9147" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#F5FDF5', border: '2px solid #93C572', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="breakfast" fill="#A8E5A8" name="Breakfast" />
            <Bar dataKey="lunch" fill="#93C572" name="Lunch" />
            <Bar dataKey="dinner" fill="#7AB55E" name="Dinner" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-pista-700 mb-3">Top Selling Items</h3>
          <div className="space-y-2">
            {['Margherita Pizza', 'Grilled Chicken', 'Caesar Salad'].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{item}</span>
                <span className="text-sm font-bold text-pista-700">{145 - i * 20}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-pista-700 mb-3">Occupancy Rate</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-pista-900 mb-2">87%</p>
            <p className="text-sm text-gray-600">87 of 100 rooms occupied</p>
            <div className="mt-4 bg-pista-100 rounded-full h-3 overflow-hidden">
              <div className="bg-pista-500 h-full" style={{ width: '87%' }}></div>
            </div>
          </div>
        </div>

        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-pista-700 mb-3">Average Response Time</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-pista-900 mb-2">12 min</p>
            <p className="text-sm text-gray-600">Service request response</p>
            <p className="text-sm text-green-600 font-semibold mt-2">↓ 3 min faster</p>
          </div>
        </div>
      </div>
    </div>
  );
}
