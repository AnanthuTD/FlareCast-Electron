import axiosInstance from '../axios/index'
import { AxiosResponse, AxiosError } from 'axios'

// Define a generic response type
interface ApiResponse<T> {
  data: T | null
  error: string | null
}

/**
 * Generic API request wrapper
 * @param request - Axios request promise
 * @returns ApiResponse with data or error
 */
export async function apiRequest<T>(request: Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
  try {
    const response = await request
    return { data: response.data, error: null }
  } catch (error) {
    const axiosError = error as AxiosError
    const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Unknown error'
    console.error('API request failed:', errorMessage)
    return { data: null, error: errorMessage }
  }
}

// Updated canRecord using the utility
export async function canRecord(): Promise<boolean> {
  const result = await apiRequest(axiosInstance.get(`/api/user/upload-permission`))
  if (result.error) {
    return false // Return false if there's an error
  }
  // Handle the response data
  return typeof result.data === 'boolean' ? result.data : result.data?.canUpload || false
}

export async function getStreamToken(): Promise<{ token; streamKey }> {
  const { data } = await axiosInstance.get(`/api/video/stream-key`)
  return data
}
