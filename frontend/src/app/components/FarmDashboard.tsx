import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MapPin, Search, Plus, Sprout, Grid3x3, List, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { getFarms, type Farm } from '../services/api';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function FarmDashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFarms();
      setFarms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const filteredFarms = farms.filter(
    (farm) =>
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Sprout className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">FarmPulse</h1>
                <p className="text-sm text-gray-600">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                Settings
              </button>
              <div className="size-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-700">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">My Farms</h2>
          <p className="text-gray-600">Manage and monitor all your agricultural operations</p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertTitle>Error Loading Farms</AlertTitle>
            <AlertDescription>
              <p className="mb-3">{error}</p>
              <button
                onClick={fetchFarms}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <RefreshCw className="size-4" />
                Retry
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Controls Bar */}
        {!error && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search farms by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                disabled={loading}
                className={`px-3 py-1.5 rounded ${
                  viewMode === 'grid'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900'
                } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Grid3x3 className="size-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                disabled={loading}
                className={`px-3 py-1.5 rounded ${
                  viewMode === 'list'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900'
                } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <List className="size-5" />
              </button>
            </div>

            {/* Add Farm Button */}
            <button
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="size-5" />
              <span>Add Farm</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i: number) => (
                  <div key={i} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                    <Skeleton className="h-40 w-full rounded-none" />
                    <div className="p-5 space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i: number) => (
                  <div key={i} className="flex items-center gap-4 bg-white rounded-lg border-2 border-gray-200 p-4">
                    <Skeleton className="size-16 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="flex gap-6">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Farms Grid/List - Success State */}
        {!loading && !error && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFarms.map((farm) => (
                  <Link
                    key={farm.id}
                    to={`/farm/${farm.id}`}
                    className="group bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 transition-all hover:shadow-lg overflow-hidden"
                  >
                    {/* Map Preview */}
                    <div className="h-40 bg-gradient-to-br from-green-100 to-green-50 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        <svg className="size-full">
                          <defs>
                            <pattern
                              id={`grid-${farm.id}`}
                              x="0"
                              y="0"
                              width="20"
                              height="20"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 20 0 L 0 0 0 20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-green-600"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#grid-${farm.id})`} />
                        </svg>
                      </div>
                      <div className="absolute top-3 right-3 size-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <MapPin className="size-5 text-green-600" />
                      </div>
                    </div>

                    {/* Farm Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                        {farm.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                        <MapPin className="size-4" />
                        {farm.location}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Fields</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {farm.fieldCount}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Last Analysis</div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(farm.lastAnalysis).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFarms.map((farm) => (
                  <Link
                    key={farm.id}
                    to={`/farm/${farm.id}`}
                    className="group flex items-center gap-4 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 transition-all p-4 hover:shadow-md"
                  >
                    <div className="size-16 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="size-8 text-green-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {farm.name}
                      </h3>
                      <p className="text-sm text-gray-600">{farm.location}</p>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Fields</div>
                        <div className="text-lg font-semibold text-gray-900">{farm.fieldCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Last Analysis</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(farm.lastAnalysis).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredFarms.length === 0 && farms.length > 0 && (
              <div className="text-center py-12">
                <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="size-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No farms found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}

            {/* No Farms State */}
            {farms.length === 0 && (
              <div className="text-center py-12">
                <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sprout className="size-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No farms yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first farm</p>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="size-5" />
                  <span>Add Your First Farm</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Made with Bob
