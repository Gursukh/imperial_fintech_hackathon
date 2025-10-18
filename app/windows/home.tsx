export default function HomePage() {
    const boxClass = "bg-white rounded-2xl shadow-md p-6";

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

    return (
        <div className="h-full rounded-2xl p-8 overflow-auto flex flex-col">
            <h1 className="text-4xl font-black mb-6 h-8">Welcome, Dragons!</h1>
            <div className="w-auto flex-grow grid grid-cols-6 grid-rows-2 gap-8">
                <div className={`${boxClass} col-span-2`}>
                    <h1 className=" font-semibold text-2xl mb-3">Import Notifications</h1>
                    <div className="bg-[#BBB] w-full h-[1px] mb-4" />
                    <div className="space-y-3">
                        {importNotifications.map((notification) => (
                            <div key={notification.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
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
                        {exportNotifications.map((notification) => (
                            <div key={notification.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
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
                    <h1 className=" font-semibold text-2xl">Packages Delivered</h1>
                    <div className="bg-[#BBB] w-full h-[1px]" /></div>

                <div className={`${boxClass} col-span-3`} >
                    <h1 className=" font-semibold text-2xl">Import Notifications</h1>
                    <div className="bg-[#BBB] w-full h-[1px]" /></div>

                <div className={`${boxClass} col-span-3`} >
                    <h1 className=" font-semibold text-2xl">Import Notifications</h1>
                    <div className="bg-[#BBB] w-full h-[1px]" /></div>
            </div>
        </div>
    );
}
