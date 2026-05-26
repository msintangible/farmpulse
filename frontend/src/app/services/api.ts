import axios, { AxiosError } from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// TypeScript interfaces based on mockData structure
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

export interface WeatherContext {
  temp: number;
  humidity: number;
  precipitation: number;
  forecast: string;
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
  weatherContext: WeatherContext;
  cropPrice: number;
}

export interface FieldDetail extends Field {
  analysisResult?: AnalysisResult;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

// Error handling helper
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
    
    if (axiosError.response) {
      // Server responded with error status
      const errorMessage = 
        axiosError.response.data?.detail || 
        axiosError.response.data?.message || 
        `Server error: ${axiosError.response.status}`;
      
      throw new Error(errorMessage);
    } else if (axiosError.request) {
      // Request made but no response received
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Error in request setup
      throw new Error(`Request error: ${axiosError.message}`);
    }
  }
  
  // Unknown error type
  throw new Error('An unexpected error occurred');
}

// API Functions

/**
 * Get all farms
 * @returns Promise<Farm[]> - List of all farms
 */
export async function getFarms(): Promise<Farm[]> {
  try {
    const response = await apiClient.get<Farm[]>('/farms');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Get all fields for a specific farm
 * @param farmId - The ID of the farm
 * @returns Promise<Field[]> - List of fields for the farm
 */
export async function getFields(farmId: string): Promise<Field[]> {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }
    
    const response = await apiClient.get<Field[]>(`/farms/${farmId}/fields`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Get detailed information for a specific field
 * @param farmId - The ID of the farm
 * @param fieldId - The ID of the field
 * @returns Promise<FieldDetail> - Detailed field information including analysis results
 */
export async function getFieldDetail(farmId: string, fieldId: string): Promise<FieldDetail> {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }
    if (!fieldId) {
      throw new Error('Field ID is required');
    }
    
    const response = await apiClient.get<FieldDetail>(`/farms/${farmId}/fields/${fieldId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Analyze a specific field
 * @param farmId - The ID of the farm
 * @param fieldId - The ID of the field
 * @param data - Optional analysis parameters
 * @returns Promise<AnalysisResult> - Analysis results
 */
export async function analyzeField(
  farmId: string, 
  fieldId: string, 
  data?: any
): Promise<AnalysisResult> {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }
    if (!fieldId) {
      throw new Error('Field ID is required');
    }
    
    const response = await apiClient.post<AnalysisResult>(
      `/farms/${farmId}/fields/${fieldId}/analyze`,
      data || {}
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Request/Response interceptors for additional functionality

// Request interceptor - can be used to add auth tokens, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Add any custom headers or auth tokens here
    // Example: config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - can be used for global error handling, logging, etc.
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handling can be added here
    // Example: redirect to login on 401, show toast notifications, etc.
    return Promise.reject(error);
  }
);

// Export the configured axios instance for advanced use cases
export { apiClient };

// Made with Bob
