'use client';

import { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { useEscrows } from '../context/escrow';
import type { Escrow } from '../types';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function AnalyticsPanel() {
    const { escrows } = useEscrows();
    const boxClass = "bg-white rounded-2xl shadow-md p-6";
    
    // Calculate analytics metrics
    const totalEscrows = escrows.length;
    const activeEscrows = escrows.filter(e => 
      e.status !== 'expired' && e.status !== 'cancelled'
    );
    const completedEscrows = escrows.filter(e => e.status === 'funds available');
    const expiredEscrows = escrows.filter(e => e.status === 'expired');
    const pendingEscrows = escrows.filter(e => 
      e.status.includes('pending')
    );
    
    // Calculate total value (convert all to USD for simplicity)
    const totalValue = escrows.reduce((sum, e) => sum + e.currencyAmount, 0);
    const avgValue = totalEscrows > 0 ? totalValue / totalEscrows : 0;
    
    const [animatedTotalValue, setAnimatedTotalValue] = useState(totalValue);
    const [animatedAvgValue, setAnimatedAvgValue] = useState(avgValue);

    // Helper function to format currency
    const formatCurrency = (amount: number, currency: string = 'USDC') => {
        try {
            return `${(amount).toFixed(2)} ${currency}`;
        } catch {
            return `${amount} ${currency}`;
        }
    };

    // Generate last 30 days labels
    const getLast30Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return days;
    };

    // Generate last 12 months labels
    const getLast12Months = () => {
        const months = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        }
        return months;
    };

    // Sample trend data (in real app, would calculate from actual escrow dates)
    const trendData = {
        labels: getLast30Days(),
        datasets: [
            {
                label: 'Escrow Value',
                data: Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 50000) + 10000),
                borderColor: '#0417B2',
                backgroundColor: 'rgba(4, 23, 178, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            }
        ]
    };

    const lineChartOptions = {      
        responsive: true,
        maintainAspectRatio: false,

        // Also animate when the canvas resizes
        transitions: {
            resize: { animation: { duration: 2000 } }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                    label: function (context: any) {
                        return `Value: ${formatCurrency(context.parsed.y)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value: any) {
                        return (value / 1000) + 'K';
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                }
            },
            x: {
                ticks: {
                    maxTicksLimit: 10,
                    font: {
                        size: 10,
                    }
                },
                grid: {
                    display: false,
                }
            }
        }
    };

    // Monthly volume data
    const volumeData = {
        labels: getLast12Months(),
        datasets: [
            {
                label: 'Transaction Volume',
                data: [45, 52, 48, 60, 65, 58, 72, 68, 75, 70, 78, 82],
                backgroundColor: '#0C9461',
                borderRadius: 6,
            }
        ]
    };

    const barChartOptions = {      
        responsive: true,
        maintainAspectRatio: false,

        // Also animate when the canvas resizes
        transitions: {
            resize: { animation: { duration: 2000 } }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 20,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                }
            },
            x: {
                grid: {
                    display: false,
                }
            }
        }
    };

    // Status distribution
    const statusDistribution = {
        labels: ['Pending', 'Completed', 'Expired', 'Cancelled'],
        datasets: [
            {
                data: [
                    pendingEscrows.length,
                    completedEscrows.length,
                    expiredEscrows.length,
                    escrows.filter(e => e.status === 'cancelled').length
                ],
                backgroundColor: [
                    '#0417B2',
                    '#0C9461',
                    'rgba(239, 68, 68, 1.0)',
                    'rgba(156, 163, 175, 1.0)'
                ],
                borderWidth: 0,
            }
        ]
    };

    const donutOptions = {      
        responsive: true,
        maintainAspectRatio: false,

        // Also animate when the canvas resizes
        transitions: {
            resize: { animation: { duration: 2000 } }
        },
        plugins: {
            legend: {
                display: true,
                position: 'right' as const,
                labels: {
                    padding: 15,
                    font: {
                        size: 13,
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            },
        },
        cutout: '65%',
    };

    // Animate key metrics
    // useEffect(() => {
    //     const duration = 0;
    //     const steps = 60;
        
    //     const totalIncrement = totalValue / steps;
    //     const avgIncrement = avgValue / steps;
        
    //     let currentStep = 0;
        
    //     const timer = setInterval(() => {
    //         currentStep++;
    //         if (currentStep >= steps) {
    //             setAnimatedTotalValue(totalValue);
    //             setAnimatedAvgValue(avgValue);
    //             clearInterval(timer);
    //         } else {
    //             setAnimatedTotalValue(Math.floor(totalIncrement * currentStep));
    //             setAnimatedAvgValue(Math.floor(avgIncrement * currentStep));
    //         }
    //     }, duration / steps);

    //     return () => clearInterval(timer);
    // }, [totalValue, avgValue]);

    return (
        <div className="h-full rounded-2xl p-8 overflow-hidden max-h-screen flex flex-col">
            <h1 className="text-4xl font-black mb-6 h-8">Analytics Dashboard</h1>
            
            {/* Key Metrics Row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className={`${boxClass} flex flex-col justify-center`}>
                    <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">Total Escrows</div>
                    <div className="text-4xl font-black text-gray-800">{totalEscrows}</div>
                    <div className="text-xs text-gray-500 mt-1">All time</div>
                </div>
                <div className={`${boxClass} flex flex-col justify-center`}>
                    <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">Active</div>
                    <div className="text-4xl font-black text-[#0417B2]">{activeEscrows.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Currently active</div>
                </div>
                <div className={`${boxClass} flex flex-col justify-center`}>
                    <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">Total Value</div>
                    <div className="text-3xl font-black text-gray-800">{formatCurrency(animatedTotalValue)}</div>
                    <div className="text-xs text-gray-500 mt-1">Cumulative</div>
                </div>
                <div className={`${boxClass} flex flex-col justify-center`}>
                    <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">Avg Value</div>
                    <div className="text-3xl font-black text-[#0C9461]">{formatCurrency(animatedAvgValue)}</div>
                    <div className="text-xs text-gray-500 mt-1">Per escrow</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-6 overflow-hidden">
                
                {/* Escrow Value Trend - Takes 2 columns */}
                <div className={`${boxClass} col-span-2 row-span-1`}>
                    <h2 className="font-semibold text-xl mb-3">Escrow Value Trend (30 Days)</h2>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="h-[calc(100%-4rem)]">
                        <Line data={trendData} options={lineChartOptions} />
                    </div>
                </div>

                {/* Status Distribution */}
                <div className={`${boxClass} col-span-1 row-span-1`}>
                    <h2 className="font-semibold text-xl mb-3">Status Distribution</h2>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="h-[calc(100%-4rem)]">
                        <Doughnut data={statusDistribution} options={donutOptions} />
                    </div>
                </div>

                {/* Monthly Transaction Volume */}
                <div className={`${boxClass} col-span-2 row-span-1`}>
                    <h2 className="font-semibold text-xl mb-3">Monthly Transaction Volume (12 Months)</h2>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="h-[calc(100%-4rem)]">
                        <Bar data={volumeData} options={barChartOptions} />
                    </div>
                </div>

                {/* Key Insights */}
                <div className={`${boxClass} col-span-1 row-span-1`}>
                    <h2 className="font-semibold text-xl mb-3">Key Insights</h2>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-[#0417B2] mb-1">
                                {((completedEscrows.length / totalEscrows) * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600 mb-1">
                                {((expiredEscrows.length / totalEscrows) * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-600">Expiration Rate</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-[#0C9461] mb-1">
                                {((activeEscrows.length / totalEscrows) * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-600">Active Rate</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
