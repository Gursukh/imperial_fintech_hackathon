'use client';

import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
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
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function HomePage() {
    const { escrows } = useEscrows();
    const boxClass = "bg-white rounded-2xl shadow-md p-6";
    const [visibleImportNotifs, setVisibleImportNotifs] = useState(0);
    const [visibleExportNotifs, setVisibleExportNotifs] = useState(0);
    const [visibleEscrowRows, setVisibleEscrowRows] = useState(0);
    const [animatedCount, setAnimatedCount] = useState(0);

    // Get active escrows (not expired or cancelled)
    const activeEscrows = escrows.filter(e => 
        e.status !== 'expired' && e.status !== 'cancelled'
    ).slice(0, 5); // Show only first 5

    console.log('Active Escrows:', activeEscrows.length);
    console.log('Visible Escrow Rows:', visibleEscrowRows);

    // Helper function to format currency
    const formatCurrency = (amount: number, currency: string) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: currency,
                maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return `${amount} ${currency}`;
        }
    };

    // Helper function to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending signature":
            case "pending shipment":
            case "pending payment": 
                return 'bg-[#0417B2]';
            case "funds available": 
                return 'bg-[#0C9461]';
            case "expired": 
                return 'bg-red-500';
            case "cancelled": 
                return 'bg-gray-500';
            default: 
                return 'bg-gray-400';
        }
    };

    // Generate last 7 days labels
    const getLast7Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateNum = date.getDate();
            days.push(`${dayName} ${dateNum}`);
        }
        return days;
    };

    // Sample data for packages delivered (you can replace with real data)
    const packagesData = {
        labels: getLast7Days(),
        datasets: [
            {
                label: 'Packages Delivered',
                data: [2, 0, 3, 6, 4, 9, 12], // Sample data for last 7 days
                backgroundColor: '#0417B2', // Blue color
                borderColor: '#0417B2',
                borderWidth: 1,
                borderRadius: 6,
            }
        ]
    };

    const chartOptions = {        
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
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 13,
                },
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 5,
                    font: {
                        size: 16,
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 11,
                    }
                },
                grid: {
                    display: false,
                }
            }
        }
    };

    // Status overview data - based on escrow statuses
    const statusData = {
        labels: ['Pending Action', 'Funds Available', 'Expired'],
        datasets: [
            {
                data: [3, 2, 1], // Sample counts for each status
                backgroundColor: [
                    '#0417B2',  // Blue - Pending Shipment
                    '#0C9461',   // Green - Funds Available
                    'rgba(239, 68, 68, 1.0)',   // Red - Pending Payment
                ],
                borderRadius: 10,
                borderWidth: [10, 10, 10]
            }
        ],

    };

    const donutOptions = {

        responsive: true,
        maintainAspectRatio: false,

        // Also animate when the canvas resizes
        transitions: {
            resize: { animation: { duration: 2000 } }
        },
        circumference: 180, // Semicircle
        rotation: -90, // Start from bottom
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    padding: 10,
                    font: {
                        size: 14,
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 13,
                },
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            },
        },
        cutout: '70%', // Donut thicknessz
        radius: "80%",
    };

    const importNotifications = [
        { id: 1, title: "Copper Cathodes Q4", status: "Pending Signature", time: "2h ago", urgent: true },
        { id: 2, title: "Green Coffee Beans Lot 7", status: "Expired", time: "19d ago", urgent: true },
        { id: 3, title: "Aluminum Sheets", status: "Funds Available", time: "2d ago", urgent: false },
    ];

    const exportNotifications = [
        { id: 1, title: "Refined Sugar Lot 12", status: "Pending Payment", time: "8d ago", urgent: true },
        { id: 2, title: "Textiles Autumn Collection", status: "Funds Available", time: "3d ago", urgent: false },
        // { id: 3, title: "Machinery Spare Parts", status: "Pending Shipment", time: "5d ago", urgent: false },
    ];

    // Stagger notification loading on mount
    useEffect(() => {
        const importTimers: NodeJS.Timeout[] = [];
        const exportTimers: NodeJS.Timeout[] = [];
        const escrowTimers: NodeJS.Timeout[] = [];

        // Reset visible count
        setVisibleEscrowRows(0);

        // Load escrow rows one by one
        activeEscrows.forEach((_, index) => {
            const timer = setTimeout(() => {
                setVisibleEscrowRows(index + 1);
            }, index * 200); // 200ms delay between each row
            escrowTimers.push(timer);
        });

        // Load import notifications one by one
        importNotifications.forEach((_, index) => {
            const timer = setTimeout(() => {
                setVisibleImportNotifs(index + 1);
            }, index * 300); // 300ms delay between each notification
            importTimers.push(timer);
        });

        // Load export notifications one by one (starting after import notifications)
        exportNotifications.forEach((_, index) => {
            const timer = setTimeout(() => {
                setVisibleExportNotifs(index + 1);
            }, index * 300); // 300ms delay between each notification
            exportTimers.push(timer);
        });

        // Cleanup timers on unmount
        return () => {
            importTimers.forEach(timer => clearTimeout(timer));
            exportTimers.forEach(timer => clearTimeout(timer));
            escrowTimers.forEach(timer => clearTimeout(timer));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeEscrows.length]);

    // Animate the counter from 0 to active escrows count
    useEffect(() => {
        const targetCount = activeEscrows.length;
        const duration = 1500; // 1.5 seconds
        const steps = 60; // 60 frames for smooth animation
        const increment = targetCount / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        setAnimatedCount(0);

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setAnimatedCount(targetCount);
                clearInterval(timer);
            } else {
                setAnimatedCount(Math.floor(increment * currentStep));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [activeEscrows.length]);

    return (
        <div className="h-full rounded-2xl p-8 overflow-hidden max-h-screen flex flex-col">
            <h1 className="text-4xl font-black mb-6 h-8">Welcome, Dragons!</h1>
            <div className="w-full h-full grid grid-cols-6 grid-rows-2 gap-8">

                <div className={`${boxClass} col-span-3`} >
                    <h1 className=" font-semibold text-2xl mb-3">Active Escrows</h1>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="overflow-auto no-scrollbar" style={{ maxHeight: 'calc(100% - 4rem)' }}>
                        {activeEscrows.length > 0 ? (
                            <table className="w-full text-sm table-fixed">
                                <thead className="sticky top-0 bg-white">
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-2 font-semibold w-[15%]">Invoice</th>
                                        <th className="text-left py-2 px-2 font-semibold w-[40%]">Name</th>
                                        <th className="text-left py-2 px-2 font-semibold w-[25%]">Status</th>
                                        <th className="text-right py-2 px-2 font-semibold w-[20%]">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeEscrows.slice(0, visibleEscrowRows).map((escrow, idx) => (
                                        <tr 
                                            key={escrow.invoiceNumber || idx} 
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fadeInSlide"
                                        >
                                            <td className="py-3 px-2 text-gray-600 truncate">{escrow.invoiceNumber || '-'}</td>
                                            <td className="py-3 px-2 font-medium truncate">{escrow.name}</td>
                                            <td className="py-3 px-2">
                                                <span className={`${getStatusColor(escrow.status)} text-white text-xs px-2 py-1 rounded-full font-semibold capitalize`}>
                                                    {escrow.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-right font-medium">
                                                {formatCurrency(escrow.currencyAmount, escrow.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                No active escrows
                            </div>
                        )}
                    </div>
                </div>

                <div className={`${boxClass} col-span-3`}>
                    <h1 className="font-semibold text-2xl mb-3">Status Overview</h1>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="h-[calc(100%-4rem)] flex items-center justify-center">
                        <div className="w-full h-full mx-auto relative">
                            <Doughnut data={statusData} options={donutOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '20%' }}>
                                <div className="text-6xl font-black text-gray-800">{animatedCount}</div>
                                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mt-1">Active Escrows</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${boxClass} col-span-2`}>
                    <h1 className=" font-semibold text-2xl mb-3">Import Notifications</h1>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="space-y-3">
                        {importNotifications.slice(0, visibleImportNotifs).map((notification, index) => (
                            <div 
                                key={notification.id} 
                                className="flex items-start justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer animate-fadeInSlide"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {notification.urgent && (
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                        <h3 className="font-medium text-sm">{notification.title}</h3>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{notification.status}</p>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`${boxClass} col-span-2`} >
                    <h1 className=" font-semibold text-2xl mb-3">Export Notifications</h1>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="space-y-3">
                        {exportNotifications.slice(0, visibleExportNotifs).map((notification, index) => (
                            <div 
                                key={notification.id} 
                                className="flex items-start justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer animate-fadeInSlide"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {notification.urgent && (
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                        <h3 className="font-medium text-sm">{notification.title}</h3>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{notification.status}</p>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`${boxClass} col-span-2`}>
                    <h1 className="font-semibold text-2xl mb-3">Packages Delivered</h1>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="h-[calc(100%-4rem)]">
                        <Bar data={packagesData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
