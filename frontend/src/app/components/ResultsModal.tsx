import { X, Download, Share2, AlertTriangle, CheckCircle2, DollarSign, TrendingDown, Thermometer, Droplets, Cloud } from 'lucide-react';
import { AnalysisResult, Field, getSeverityColor } from '../data/mockData';

interface ResultsModalProps {
  analysisResult: AnalysisResult;
  field: Field;
  onClose: () => void;
}

export default function ResultsModal({ analysisResult, field, onClose }: ResultsModalProps) {
  const severityColors = getSeverityColor(analysisResult.severity);

  const getPriorityIcon = (index: number) => {
    if (index === 0 && analysisResult.severity === 'critical') {
      return <AlertTriangle className="size-5 text-red-600" />;
    }
    return <CheckCircle2 className="size-5 text-green-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analysis Report</h2>
            <p className="text-sm text-gray-600">
              {field.name} • {field.cropType} • {field.size} acres
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/80 rounded-lg transition-colors" title="Download Report">
              <Download className="size-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-white/80 rounded-lg transition-colors" title="Share Report">
              <Share2 className="size-5 text-gray-700" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            >
              <X className="size-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className={`${severityColors.bg} border-2 ${severityColors.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`size-5 ${severityColors.text}`} />
                <span className="text-xs font-medium text-gray-600">Severity Level</span>
              </div>
              <div className={`text-2xl font-bold ${severityColors.text} capitalize`}>
                {analysisResult.severity}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {analysisResult.severity === 'critical' && 'Immediate action required'}
                {analysisResult.severity === 'high' && 'Action needed soon'}
                {analysisResult.severity === 'medium' && 'Monitor closely'}
                {analysisResult.severity === 'low' && 'Routine maintenance'}
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="size-5 text-blue-600" />
                <span className="text-xs font-medium text-gray-600">Financial Impact</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                ${analysisResult.financialImpact.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Estimated loss without intervention
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="size-5 text-orange-600" />
                <span className="text-xs font-medium text-gray-600">Yield Loss</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {analysisResult.yieldLossPercent}%
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Projected reduction in harvest
              </p>
            </div>
          </div>

          {/* Weather Context */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="size-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Weather Context</h3>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="size-4 text-orange-600" />
                  <span className="text-xs text-gray-600">Temperature</span>
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {analysisResult.weatherContext.temp}°F
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="size-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Humidity</span>
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {analysisResult.weatherContext.humidity}%
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="size-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Precipitation</span>
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {analysisResult.weatherContext.precipitation}"
                </div>
              </div>
            </div>

            <div className="bg-white/80 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-600 mb-1">5-Day Forecast</div>
              <p className="text-sm text-gray-900">{analysisResult.weatherContext.forecast}</p>
            </div>
          </div>

          {/* Crop Price Context */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 mb-1">Current {field.cropType} Price</div>
                <div className="text-2xl font-bold text-green-700">
                  ${analysisResult.cropPrice}/bushel
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">Potential Revenue Loss</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${(analysisResult.financialImpact).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI-Generated Action Plan
            </h3>

            <div className="space-y-3">
              {analysisResult.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className={`flex gap-4 p-4 rounded-lg border-2 ${
                    index === 0 && analysisResult.severity === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getPriorityIcon(index)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        Step {index + 1}
                      </span>
                      {index === 0 && analysisResult.severity === 'critical' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                          URGENT
                        </span>
                      )}
                      {index < 2 && analysisResult.severity !== 'low' && analysisResult.severity !== 'critical' && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                          Priority
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span>Analysis ID: {analysisResult.id}</span>
              <span>
                Generated: {new Date(analysisResult.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="mt-2">
              <span className="font-medium">Data Sources:</span> Satellite NDVI Imagery, NOAA Weather Data, USDA Crop Price Index, Local Soil Moisture Sensors
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-between">
          <button className="text-sm text-gray-700 hover:text-gray-900 font-medium">
            Schedule Follow-up Analysis
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Export Report (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
