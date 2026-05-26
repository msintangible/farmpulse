export interface Farm {
  id: string;
  name: string;
  location: string;
  fieldCount: number;
  lastAnalysis: string;
  coordinates: [number, number];
}

export interface Field {
  id: string;
  farmId: string;
  name: string;
  cropType: string;
  size: number; // acres
  coordinates: [number, number];
  boundary: [number, number][];
  ndviScore: number; // 0-1 scale
  lastUpdated: string;
}

export interface AnalysisResult {
  id: string;
  fieldId: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  financialImpact: number;
  yieldLossPercent: number;
  ndviScore: number;
  recommendations: string[];
  weatherContext: {
    temp: number;
    humidity: number;
    precipitation: number;
    forecast: string;
  };
  cropPrice: number;
}

export const mockFarms: Farm[] = [
  {
    id: 'farm-1',
    name: 'Green Valley Farm',
    location: 'Iowa, USA',
    fieldCount: 4,
    lastAnalysis: '2026-05-24',
    coordinates: [41.8780, -93.0977],
  },
  {
    id: 'farm-2',
    name: 'Sunrise Acres',
    location: 'Nebraska, USA',
    fieldCount: 3,
    lastAnalysis: '2026-05-25',
    coordinates: [40.8136, -96.7026],
  },
  {
    id: 'farm-3',
    name: 'Prairie Gold',
    location: 'Kansas, USA',
    fieldCount: 5,
    lastAnalysis: '2026-05-20',
    coordinates: [39.0119, -95.6788],
  },
];

export const mockFields: Field[] = [
  {
    id: 'field-1',
    farmId: 'farm-1',
    name: 'North Field',
    cropType: 'Corn',
    size: 45,
    coordinates: [41.8800, -93.0977],
    boundary: [
      [41.8800, -93.0977],
      [41.8810, -93.0977],
      [41.8810, -93.0960],
      [41.8800, -93.0960],
      [41.8800, -93.0977],
    ],
    ndviScore: 0.85,
    lastUpdated: '2026-05-24',
  },
  {
    id: 'field-2',
    farmId: 'farm-1',
    name: 'South Field',
    cropType: 'Soybeans',
    size: 38,
    coordinates: [41.8760, -93.0977],
    boundary: [
      [41.8760, -93.0977],
      [41.8770, -93.0977],
      [41.8770, -93.0960],
      [41.8760, -93.0960],
      [41.8760, -93.0977],
    ],
    ndviScore: 0.65,
    lastUpdated: '2026-05-24',
  },
  {
    id: 'field-3',
    farmId: 'farm-1',
    name: 'East Pasture',
    cropType: 'Wheat',
    size: 52,
    coordinates: [41.8780, -93.0950],
    boundary: [
      [41.8780, -93.0950],
      [41.8790, -93.0950],
      [41.8790, -93.0933],
      [41.8780, -93.0933],
      [41.8780, -93.0950],
    ],
    ndviScore: 0.42,
    lastUpdated: '2026-05-23',
  },
  {
    id: 'field-4',
    farmId: 'farm-1',
    name: 'West Field',
    cropType: 'Corn',
    size: 41,
    coordinates: [41.8780, -93.1000],
    boundary: [
      [41.8780, -93.1000],
      [41.8790, -93.1000],
      [41.8790, -93.0983],
      [41.8780, -93.0983],
      [41.8780, -93.1000],
    ],
    ndviScore: 0.78,
    lastUpdated: '2026-05-24',
  },
];

export const mockAnalysisResults: Record<string, AnalysisResult> = {
  'field-1': {
    id: 'analysis-1',
    fieldId: 'field-1',
    timestamp: '2026-05-24T14:30:00Z',
    severity: 'low',
    financialImpact: 2400,
    yieldLossPercent: 3,
    ndviScore: 0.85,
    recommendations: [
      'Continue current irrigation schedule - soil moisture levels are optimal',
      'Monitor eastern section for early signs of nitrogen deficiency',
      'Scout for corn rootworm in 7-10 days as preventive measure',
      'Weather forecast favorable for next 5 days - no action needed',
    ],
    weatherContext: {
      temp: 72,
      humidity: 65,
      precipitation: 0.2,
      forecast: 'Partly cloudy, light rain expected in 3 days',
    },
    cropPrice: 5.85,
  },
  'field-2': {
    id: 'analysis-2',
    fieldId: 'field-2',
    timestamp: '2026-05-24T14:35:00Z',
    severity: 'medium',
    financialImpact: 8900,
    yieldLossPercent: 12,
    ndviScore: 0.65,
    recommendations: [
      'Apply nitrogen fertilizer to southern quadrant within 48 hours',
      'Increase irrigation by 15% for next week - soil moisture below optimal',
      'Check for aphid infestation - spotted in neighboring fields',
      'Consider foliar application of micronutrients (zinc, manganese)',
      'Re-analyze in 7 days to assess treatment effectiveness',
    ],
    weatherContext: {
      temp: 75,
      humidity: 58,
      precipitation: 0.1,
      forecast: 'Sunny, no precipitation expected for 5 days',
    },
    cropPrice: 13.25,
  },
  'field-3': {
    id: 'analysis-3',
    fieldId: 'field-3',
    timestamp: '2026-05-23T10:15:00Z',
    severity: 'critical',
    financialImpact: 24500,
    yieldLossPercent: 28,
    ndviScore: 0.42,
    recommendations: [
      'URGENT: Apply fungicide immediately - rust disease detected in 40% of field',
      'Isolate affected area to prevent spread to adjacent fields',
      'Increase scouting frequency to twice daily for next 10 days',
      'Contact local extension office for disease identification confirmation',
      'Prepare for potential yield reduction - consider crop insurance claim',
      'Apply supplemental potassium fertilizer to stressed plants',
      'Delay harvest by 2-3 weeks if possible to allow recovery',
      'Document all treatments for insurance and record-keeping',
    ],
    weatherContext: {
      temp: 68,
      humidity: 78,
      precipitation: 1.2,
      forecast: 'High humidity, continued wet conditions favor disease spread',
    },
    cropPrice: 7.15,
  },
};

export function getNDVIStatus(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 0.75) {
    return { label: 'Healthy', color: 'text-green-700', bgColor: 'bg-green-100' };
  } else if (score >= 0.6) {
    return { label: 'Good', color: 'text-green-600', bgColor: 'bg-green-50' };
  } else if (score >= 0.45) {
    return { label: 'Warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  } else if (score >= 0.3) {
    return { label: 'Critical', color: 'text-orange-600', bgColor: 'bg-orange-50' };
  } else {
    return { label: 'Severe', color: 'text-red-600', bgColor: 'bg-red-50' };
  }
}

export function getSeverityColor(severity: string): {
  text: string;
  bg: string;
  border: string;
} {
  switch (severity) {
    case 'low':
      return { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
    case 'medium':
      return { text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    case 'high':
      return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
    case 'critical':
      return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
    default:
      return { text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };
  }
}
