import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const InventoryPieChart = ({ ingredients, t }) => {
    // Data preparation: Top 5 materials by quantity, others grouped as "Other"
    const sortedIngs = [...ingredients]
        .filter(i => i.quantity > 0)
        .sort((a, b) => b.quantity - a.quantity);

    const top5 = sortedIngs.slice(0, 5);
    const others = sortedIngs.slice(5);

    const data = top5.map(i => ({
        name: i.name,
        value: i.quantity,
        unit: t.unitNames?.[i.unit] || i.unit
    }));

    if (others.length > 0) {
        data.push({
            name: t.common.allInStock || 'Others',
            value: others.reduce((sum, i) => sum + i.quantity, 0),
            unit: ''
        });
    }

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-[var(--text-light)] text-sm">
                {t.dashboard.noData}
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: 'var(--text-main)'
                        }}
                        itemStyle={{ color: 'var(--text-main)' }}
                        formatter={(value, name, props) => [`${value} ${props.payload.unit || ''}`, name]}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default InventoryPieChart;
