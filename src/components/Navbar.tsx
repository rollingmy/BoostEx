import Link from "next/link";
import { LineChart, Search } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <LineChart className="h-6 w-6 text-indigo-600 mr-2" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">ExtensionBooster</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/analyze"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
              >
                ASO Analyzer
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
              Add Extension
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
