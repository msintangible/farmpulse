import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import { ArrowLeft, Activity, DollarSign, TrendingDown, AlertCircle, Sparkles, Clock, Thermometer, Droplets, Cloud, RefreshCw } from 'lucide-react';
import { getFieldDetail, analyzeField, FieldDetail, AnalysisResult } from '../services/api';
import { getNDVIStatus, getSeverityColor } from '../data/mockData';
import ResultsModal from './ResultsModal';
import { Skeleton } from './ui/skeleton';
import '../utils/leafletConfig';
import 'leaflet/dist/leaflet.css';

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);

  return null;
}

export default function FieldDetailView() {
  const { farmId, fieldId } = useParams();
  const [fieldDetail, setFieldDetail] = useState<FieldDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Fetch field details on mount or when farmId/fieldId changes
  useEffect(() => {
    const fetchFieldDetail = async () => {
      if (!farmId || !fieldId) {
        setError('Farm ID and Field ID are required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getFieldDetail(farmId, fieldId);
        setFieldDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load field details');
      } finally {
        setLoading(false);
      }
    };

    fetchFieldDetail();
  }, [farmId, fieldId]);

  const handleRunAnalysis = async () => {
    if (!farmId || !fieldId) return;

    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress(0);

    // Progress animation
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 3.33;
      });
    }, 100);

    try {
      const result = await analyzeField(farmId, fieldId);
      
      // Complete progress
      setAnalysisProgress(100);
      clearInterval(interval);
      
      // Update field detail with new analysis result
      setFieldDetail((prev) => prev ? { ...prev, analysisResult: result } : null);
      setShowResults(true);
    } catch (err) {
      clearInterval(interval);
      setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze field');
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger re-fetch by updating a dependency
    if (farmId && fieldId) {
      getFieldDetail(farmId, fieldId)
        .then((data) => {
          setFieldDetail(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load field details');
          setLoading(false);
        });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to={`/farm/${farmId}`}
                  className="size-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="size-5 text-gray-700" />
                </Link>
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                to={`/farm/${farmId}`}
                className="size-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="size-5 text-gray-700" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Field Details</h1>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border-2 border-red-200 p-8 text-center">
            <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="size-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Field Details</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="size-5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!fieldDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                to={`/farm/${farmId}`}
                className="size-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="size-5 text-gray-700" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Field Details</h1>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
            <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="size-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Field Not Found</h2>
            <p className="text-gray-600 mb-6">The requested field could not be found.</p>
            <Link
              to={`/farm/${farmId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="size-5" />
              <span>Back to Farm</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ndviStatus = getNDVIStatus(fieldDetail.ndviScore);
  const analysisResult = fieldDetail.analysisResult;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/farm/${farmId}`}
                className="size-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="size-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{fieldDetail.name}</h1>
                <p className="text-sm text-gray-600">
                  {fieldDetail.cropType} • {fieldDetail.size} acres
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/30"
            >
              {analyzing ? (
                <>
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Map & Field Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
              <div className="h-96 relative">
                <MapContainer
                  center={fieldDetail.coordinates}
                  zoom={13}
                  className="size-full"
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Polygon
                    positions={fieldDetail.boundary}
                    pathOptions={{
                      color: fieldDetail.ndviScore >= 0.6 ? '#16a34a' : fieldDetail.ndviScore >= 0.45 ? '#eab308' : '#dc2626',
                      fillColor: fieldDetail.ndviScore >= 0.6 ? '#22c55e' : fieldDetail.ndviScore >= 0.45 ? '#facc15' : '#ef4444',
                      fillOpacity: 0.3,
                      weight: 3,
                    }}
                  />
                  <MapController center={fieldDetail.coordinates} />
                </MapContainer>
              </div>

              {/* Field Stats Bar */}
              <div className="border-t p-4 bg-gray-50">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Field Size</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fieldDetail.size} acres
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Crop Type</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fieldDetail.cropType}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Last Updated</div>
                    <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(fieldDetail.lastUpdated).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Error */}
            {analysisError && !analyzing && (
              <div className="bg-white rounded-xl border-2 border-red-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="size-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Analysis Failed</h3>
                    <p className="text-sm text-gray-600">{analysisError}</p>
                  </div>
                </div>
                <button
                  onClick={handleRunAnalysis}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <RefreshCw className="size-4" />
                  <span>Try Again</span>
                </button>
              </div>
            )}

            {/* Analysis Progress */}
            {analyzing && (
              <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="size-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Analysis in Progress</h3>
                    <p className="text-sm text-gray-600">Processing satellite data and weather conditions...</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-green-600">{Math.round(analysisProgress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all duration-300 rounded-full"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Estimated time remaining: {Math.max(0, Math.round((100 - analysisProgress) * 0.3))}s
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Results Card */}
            {analysisResult && !analyzing && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Latest Analysis Results</h3>
                  <button
                    onClick={() => setShowResults(true)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    View Full Report
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className={`${getSeverityColor(analysisResult.severity).bg} border-2 ${getSeverityColor(analysisResult.severity).border} rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className={`size-5 ${getSeverityColor(analysisResult.severity).text}`} />
                      <span className="text-xs font-medium text-gray-600">Severity</span>
                    </div>
                    <div className={`text-lg font-semibold ${getSeverityColor(analysisResult.severity).text} capitalize`}>
                      {analysisResult.severity}
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="size-5 text-blue-600" />
                      <span className="text-xs font-medium text-gray-600">Financial Impact</span>
                    </div>
                    <div className="text-lg font-semibold text-blue-700">
                      ${analysisResult.financialImpact.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="size-5 text-orange-600" />
                      <span className="text-xs font-medium text-gray-600">Yield Loss</span>
                    </div>
                    <div className="text-lg font-semibold text-orange-700">
                      {analysisResult.yieldLossPercent}%
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Top Recommendations</h4>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-green-600 shrink-0">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Health Metrics */}
          <div className="space-y-6">
            {/* NDVI Health Card */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="size-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">NDVI Health Index</h3>
              </div>

              <div className="mb-4">
                <div className="flex items-end justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {(fieldDetail.ndviScore * 100).toFixed(0)}
                  </span>
                  <span className="text-lg text-gray-600 mb-1">/ 100</span>
                </div>

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ndviStatus.bgColor} ${ndviStatus.color}`}>
                  {ndviStatus.label}
                </div>
              </div>

              {/* NDVI Spectrum */}
              <div className="space-y-2">
                <div className="h-3 rounded-full overflow-hidden bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Critical</span>
                  <span>Warning</span>
                  <span>Healthy</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  NDVI (Normalized Difference Vegetation Index) measures plant health based on how vegetation reflects light. Higher values indicate healthier, more vigorous crops.
                </p>
              </div>
            </div>

            {/* Weather Context */}
            {analysisResult && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Cloud className="size-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Weather Context</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Thermometer className="size-4 text-orange-600" />
                      <span>Temperature</span>
                    </div>
                    <span className="font-medium text-gray-900">{analysisResult.weatherContext.temp}°F</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Droplets className="size-4 text-blue-600" />
                      <span>Humidity</span>
                    </div>
                    <span className="font-medium text-gray-900">{analysisResult.weatherContext.humidity}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Cloud className="size-4 text-gray-600" />
                      <span>Precipitation</span>
                    </div>
                    <span className="font-medium text-gray-900">{analysisResult.weatherContext.precipitation}"</span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-xs text-gray-600 mb-1">5-Day Forecast</div>
                    <p className="text-sm text-gray-900">{analysisResult.weatherContext.forecast}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis History */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Analysis History</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="size-2 bg-green-600 rounded-full mt-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Latest Analysis</div>
                    <div className="text-xs text-gray-600">
                      {fieldDetail.lastUpdated}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-green-600">Complete</div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b opacity-60">
                  <div className="size-2 bg-gray-400 rounded-full mt-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Previous Scan</div>
                    <div className="text-xs text-gray-600">7 days ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="size-2 bg-gray-400 rounded-full mt-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Initial Baseline</div>
                    <div className="text-xs text-gray-600">14 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && analysisResult && (
        <ResultsModal
          analysisResult={analysisResult}
          field={fieldDetail}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
