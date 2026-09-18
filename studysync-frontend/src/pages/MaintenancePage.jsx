import React from 'react';
import { AlertTriangle, Hammer, RefreshCw } from 'lucide-react';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border-t-8 border-yellow-400">
                <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                    <Hammer className="w-10 h-10 text-yellow-600" />
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Under Maintenance</h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    We are currently performing scheduled improvements to make SyncroLearn even better.
                    We apologize for any inconvenience. Please check back soon!
                </p>

                <div className="flex justify-center flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Try Again
                    </button>
                    <a
                        href="mailto:support@syncrolearn.com"
                        className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Contact Support
                    </a>
                </div>
            </div>

            <p className="mt-8 text-gray-400 text-sm font-medium">
                &copy; {new Date().getFullYear()} SyncroLearn. All systems operational soon.
            </p>
        </div>
    );
};

export default MaintenancePage;
