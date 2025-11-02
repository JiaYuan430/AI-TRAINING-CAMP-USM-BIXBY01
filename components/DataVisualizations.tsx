
import React, { useMemo } from 'react';
import { DeliveryData } from '../types';
import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface DataVisualizationsProps {
  data: DeliveryData[];
}

const COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#047857', '#065f46', '#064e3b'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    if (payload[0].payload['地址']) { // Bar chart
        return (
            <div className="bg-background-secondary p-3 border border-slate-600 rounded-md shadow-lg">
              <p className="label text-text-primary">{`${payload[0].payload['地址']}`}</p>
              <p className="intro text-text-secondary">{`Quantity: ${payload[0].value}`}</p>
            </div>
          );
    }
     if (payload[0].payload.Distance_km) { // Scatter chart
        return (
            <div className="bg-background-secondary p-3 border border-slate-600 rounded-md shadow-lg">
              <p className="label text-text-primary">{`${payload[0].payload['地址']}`}</p>
              <p className="intro text-text-secondary">{`Distance: ${payload[0].value} km`}</p>
              <p className="intro text-text-secondary">{`Time: ${payload[1].value} min`}</p>
            </div>
          );
    }
  }
  return null;
};


const DataVisualizations: React.FC<DataVisualizationsProps> = ({ data }) => {

  const top10Data = useMemo(() => {
    return [...data]
      .sort((a, b) => b['数量'] - a['数量'])
      .slice(0, 10);
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-background-secondary p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-brand-primary">Distance vs. Delivery Time</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                type="number" 
                dataKey="Distance_km" 
                name="Distance" 
                unit="km" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                type="number" 
                dataKey="Delivery_time_min" 
                name="Time" 
                unit="min" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter name="Deliveries" data={data} fill="#14b8a6" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-background-secondary p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-brand-primary">Top 10 Locations by Order Quantity</h3>
         <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={top10Data} margin={{ top: 5, right: 20, left: -10, bottom: 5, }} >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="地址" stroke="#94a3b8" tick={false} label={{ value: 'Addresses', position: 'insideBottom', fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }}/>
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(20, 184, 166, 0.1)'}}/>
                    <Bar dataKey="数量" name="Quantity">
                        {top10Data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizations;

