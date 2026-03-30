import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-medium">PhishGatto</span>
        </div>
      </div>
    </header>
  );
}
