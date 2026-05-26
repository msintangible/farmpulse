import { Sprout, Leaf, TrendingUp, MapPin } from 'lucide-react';
import { Link } from 'react-router';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Sprout className="size-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">FarmPulse</span>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm text-green-700 hover:text-green-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full text-sm text-green-800">
                <Leaf className="size-4" />
                <span>AI-Powered Field Analysis</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl tracking-tight">
                <span className="text-gray-900">AI-Powered</span>
                <br />
                <span className="text-green-600">Field Health</span>
                <br />
                <span className="text-gray-900">in 30 Seconds</span>
              </h1>

              <p className="text-lg text-gray-600 max-w-xl">
                Monitor crop health, detect issues early, and maximize yields with satellite-powered NDVI analysis and AI-driven recommendations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30"
                >
                  Start Analyzing
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">30s</div>
                  <div className="text-sm text-gray-600">Analysis Time</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Monitoring</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 p-1 shadow-2xl">
                <div className="size-full bg-white rounded-2xl p-8 flex flex-col justify-center space-y-6">
                  {/* Mock Dashboard Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="size-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                        <div className="h-2 bg-gray-100 rounded w-24" />
                      </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-2.5 bg-green-600 rounded w-20" />
                        <div className="size-8 bg-green-600 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-green-200 rounded w-full" />
                        <div className="h-2 bg-green-200 rounded w-4/5" />
                      </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-2.5 bg-yellow-600 rounded w-20" />
                        <div className="size-8 bg-yellow-600 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-yellow-200 rounded w-full" />
                        <div className="h-2 bg-yellow-200 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-600">Yield Increase</div>
                    <div className="text-lg font-semibold text-gray-900">+15%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-20 border-t">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Everything you need to optimize your fields
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powered by satellite imagery, AI analysis, and real-time weather data
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-green-200 transition-colors">
              <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="size-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                NDVI Analysis
              </h3>
              <p className="text-gray-600">
                Satellite-powered vegetation index monitoring to detect crop stress before it's visible
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-blue-200 transition-colors">
              <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="size-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Yield Predictions
              </h3>
              <p className="text-gray-600">
                AI-driven forecasts of crop performance and financial impact analysis
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-amber-200 transition-colors">
              <div className="size-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="size-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Field Mapping
              </h3>
              <p className="text-gray-600">
                Interactive maps with custom field boundaries and zone-specific recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Sprout className="size-5 text-white" />
              </div>
              <span className="text-sm text-gray-600">© 2026 FarmPulse. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-green-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-green-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-green-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
