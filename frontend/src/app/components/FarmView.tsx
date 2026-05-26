import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { MapPin, ArrowLeft, Sprout, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { getFields, type Field } from '../services/api';
import { getNDVIStatus } from '../data/mockData';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function FarmView() {
  const { farmId } = useParams();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = async () => {
    if (!farmId) {
      setError('Farm ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getFields(farmId);
      setFields(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [farmId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Skeleton */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_: undefined, i: number) => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>

          {/* Fields Grid Skeleton */}
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_: undefined, i: number) => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-5">
                  <Skeleton className="h-6 w-32 mb-3" />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <Skeleton className="h-3 w-16 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-16 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="size-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="size-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Farm View</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Fields</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
            </AlertDescription>
            <button
              onClick={fetchFields}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <RefreshCw className="size-4" />
              Retry
            </button>
          </Alert>
        </div>
      </div>
    );
  }

  // Farm not found state (when farmId is missing)
  if (!farmId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Farm not found</h2>
          <Link to="/dashboard" className="text-green-600 hover:text-green-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate farm statistics from fields data
  const totalArea = fields.reduce((sum: number, f: Field) => sum + f.size, 0);
  const avgNDVI = fields.length > 0
    ? (fields.reduce((sum: number, f: Field) => sum + f.ndviScore, 0) / fields.length) * 100
    : 0;
  const lastUpdated = fields.length > 0
    ? new Date(Math.max(...fields.map((f: Field) => new Date(f.lastUpdated).getTime())))
    : new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="size-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="size-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Farm View</h1>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="size-4" />
                <span>Farm ID: {farmId}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Farm Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="text-sm text-gray-600 mb-1">Total Fields</div>
            <div className="text-3xl font-bold text-gray-900">{fields.length}</div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="text-sm text-gray-600 mb-1">Total Area</div>
            <div className="text-3xl font-bold text-gray-900">
              {totalArea.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">acres</div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="text-sm text-gray-600 mb-1">Avg. NDVI</div>
            <div className="text-3xl font-bold text-gray-900">
              {avgNDVI.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">/ 100</div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="text-sm text-gray-600 mb-1">Last Updated</div>
            <div className="text-lg font-semibold text-gray-900">
              {lastUpdated.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Fields Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fields</h2>
        </div>

        {fields.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => {
              const ndviStatus = getNDVIStatus(field.ndviScore);

              return (
                <Link
                  key={field.id}
                  to={`/farm/${farmId}/field/${field.id}`}
                  className="group bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 transition-all hover:shadow-lg overflow-hidden"
                >
                  {/* Field Preview */}
                  <div className={`h-32 relative overflow-hidden ${
                    field.ndviScore >= 0.6
                      ? 'bg-gradient-to-br from-green-100 to-green-50'
                      : field.ndviScore >= 0.45
                      ? 'bg-gradient-to-br from-yellow-100 to-yellow-50'
                      : 'bg-gradient-to-br from-red-100 to-red-50'
                  }`}>
                    <div className="absolute inset-0 opacity-20">
                      <svg className="size-full">
                        <defs>
                          <pattern
                            id={`pattern-${field.id}`}
                            x="0"
                            y="0"
                            width="30"
                            height="30"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 30 0 L 0 0 0 30"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="0.5"
                              className={
                                field.ndviScore >= 0.6
                                  ? 'text-green-600'
                                  : field.ndviScore >= 0.45
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }
                            />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#pattern-${field.id})`} />
                      </svg>
                    </div>

                    <div className="absolute top-3 right-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${ndviStatus.bgColor} ${ndviStatus.color} backdrop-blur-sm`}>
                        {ndviStatus.label}
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Activity className="size-4 text-gray-700" />
                        <span className="text-sm font-semibold text-gray-900">
                          {(field.ndviScore * 100).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Field Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      {field.name}
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Crop Type</div>
                        <div className="flex items-center gap-1">
                          <Sprout className="size-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">{field.cropType}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Size</div>
                        <div className="text-sm font-medium text-gray-900">{field.size} acres</div>
                      </div>
                    </div>

                    <button className="w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                      View Field Details
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="size-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fields yet</h3>
            <p className="text-gray-600 mb-4">Add your first field to start monitoring</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Add Field
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
