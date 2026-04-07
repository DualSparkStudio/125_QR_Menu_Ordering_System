'use client';

import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7days');

  // Monthly revenue data
  const monthlyRevenue = [
    { month: 'Jan', revenue: 245000, expenses: 145000, profit: 100000 },
    { month: 'Feb', revenue: 282000, expenses: 162000, profit: 120000 },
    { month: 'Mar', revenue: 268000, expenses: 158000, profit: 110000 },
    { month: 'Apr', revenue: 315000, expenses: 175000, profit: 140000 },
    { month: 'May', revenue: 298000, expenses: 168000, profit: 130000 },
    { month: 'Jun', revenue: 342000, expenses: 182000, profit: 160000 },
  ];

  // Category-wise revenue
  const categoryRevenue = [
    { name: 'Room Bookings', value: 850000, color: '#93C572' },
    { name: 'Food & Beverage', value: 420000, color: '#7AB55E' },
    { name: 'Services', value: 180000, color: '#5F9147' },
    { name: 'Other', value: 100000, color: '#A8E5A8' },
  ];

  // Daily occupancy
  const occupancyData = [
    { day: 'Mon', occupancy: 85 },
    { day: 'Tue', occupancy: 88 },
    { day: 'Wed', occupancy: 82 },
    { day: 'Thu', occupancy: 90 },
    { day: 'Fri', occupancy: 95 },
    { day: 'Sat', occupancy: 98 },
    { day: 'Sun', occupancy: 92 },
  ];

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-pista-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Detailed insights and performance metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border-2 border-pista-200 rounded-lg bg-white text-gray-700 font-medium"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <p className="text-xs text-pista-600 uppercase mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-pista-900 mb-1">₹17.5L</p>
          <p className="text-sm text-green-600 font-semibold">↑ 12.5% from last period</p>
        </div>
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <p className="text-xs text-pista-600 uppercase mb-2">Total Profit</p>
          <p className="text-3xl font-bold text-pista-900 mb-1">₹7.6L</p>
          <p className="text-sm text-green-600 font-semibold">↑ 15.2% from last period</p>
        </div>
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <p className="text-xs text-pista-600 uppercase mb-2">Avg Occupancy</p>
          <p className="text-3xl font-bold text-pista-900 mb-1">89%</p>
          <p className="text-sm text-green-600 font-semibold">↑ 5.1% from last period</p>
        </div>
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <p className="text-xs text-pista-600 uppercase mb-2">Guest Satisfaction</p>
          <p className="text-3xl font-bold text-pista-900 mb-1">4.7/5</p>
          <p className="text-sm text-green-600 font-semibold">↑ 0.3 from last period</p>
        </div>
      </div>

      {/* Revenue & Profit Chart */}
      <div className="glass-effect border-2 border-pista-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-pista-900 mb-4">Revenue & Profit Trend</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8F9E8" />
            <XAxis dataKey="month" stroke="#5F9147" />
            <YAxis stroke="#5F9147" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#F5FDF5', border: '2px solid #93C572', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#93C572" strokeWidth={3} name="Revenue (₹)" />
            <Line type="monotone" dataKey="profit" stroke="#5F9147" strokeWidth={3} name="Profit (₹)" />
            <Line type="monotone" dataKey="expenses" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="5 5" name="Expenses (₹)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Revenue */}
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-pista-900 mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryRevenue}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryRevenue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Rate */}
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-pista-900 mb-4">Daily Occupancy Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F9E8" />
              <XAxis dataKey="day" stroke="#5F9147" />
              <YAxis stroke="#5F9147" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#F5FDF5', border: '2px solid #93C572', borderRadius: '8px' }}
              />
              <Bar dataKey="occupancy" fill="#93C572" name="Occupancy %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-pista-700 mb-3 uppercase">Top Revenue Sources</h3>
          <div className="space-y-3">
            {[
              { name: 'Presidential Suite', revenue: 450000 },
              { name: 'Deluxe Rooms', revenue: 320000 },
              { name: 'Restaurant', revenue: 280000 },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-sm font-bold text-pista-700">₹{(item.revenue / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-pista-700 mb-3 uppercase">Service Performance</h3>
          <div className="space-y-3">
            {[
              { name: 'Room Service', rating: 4.8 },
              { name: 'Housekeeping', rating: 4.6 },
              { name: 'Maintenance', rating: 4.5 },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-sm font-bold text-yellow-600">★ {item.rating}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-pista-700 mb-3 uppercase">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Bookings</span>
              <span className="text-sm font-bold text-pista-700">342</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Avg Stay Duration</span>
              <span className="text-sm font-bold text-pista-700">3.2 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Repeat Guests</span>
              <span className="text-sm font-bold text-pista-700">28%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
