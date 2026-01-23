import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ProductionAreaChart = ({ history, t }) => {
    // Prepare data for the last 30 days
    const days = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        days.push({
            date: d.toISOString().split('T')[0],
            displayDate: d.toLocaleDateString(t.code === 'uk' ? 'uk' : t.code === 'en' ? 'en' : 'ru', { day: 'numeric', month: 'short' }),
            production: 0,
            writeoff: 0
        });
    }

    history.forEach(h => {
        const dateStr = new Date(h.date).toISOString().split('T')[0];
        const day = days.find(d => d.date === dateStr);
        if (day) {
            if (h.type === 'Производство' || h.type === 'Виробництво') {
                // Try to extract quantity from description or just count
                const qtyMatch = h.description.match(/(\d+(?:\.\d+)?)/);
                day.production += qtyMatch ? parseFloat(qtyMatch[1]) : 1;
            } else if (h.type === 'Списание' || h.type === 'Списання') {
                const qtyMatch = h.description.match(/(\d+(?:\.\d+)?)/);
                day.writeoff += qtyMatch ? parseFloat(qtyMatch[1]) : 1;
            }
        }
    });

    const hasData = days.some(d => d.production > 0 || d.writeoff > 0);

    if (!hasData) {
        return (
            <div className="h-64 flex items-center justify-center text-[var(--text-light)] text-sm italic">
                {t.dashboard.noData}
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorWriteoff" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-light)', fontSize: 10 }}
                        minTickGap={30}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-light)', fontSize: 10 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                    <Area
                        name={t.dashboard.production}
                        type="monotone"
                        dataKey="production"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorProduction)"
                    />
                    <Area
                        name={t.dashboard.writeoff}
                        type="monotone"
                        dataKey="writeoff"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorWriteoff)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProductionAreaChart;
