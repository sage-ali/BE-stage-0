import { GenderizeResponse, TransformedGenderizeResponse } from "@/types/genderise.types";
import { ApiError, NoPredictionError } from "@/errors/ExternalApiErrors";
import { fetch as nodeFetch, ProxyAgent } from "undici"; // <-- Import undici

/**
 * Fetches gender prediction for a given name from the Genderize.io API.
 *
 * @param name - The name to classify.
 * @returns A promise that resolves to a transformed gender prediction object.
 * @throws {NoPredictionError} If the API returns no prediction for the name.
 * @throws {ApiError} If the external API request fails, times out, or returns an error status.
 */
export const getGenderFromName = async (name: string): Promise<TransformedGenderizeResponse> => {
  const GENDERIZE_API_TIMEOUT_MS = 5000; // 5-second timeout

  const url = new URL('https://api.genderize.io');
  url.searchParams.set('name', name);

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), GENDERIZE_API_TIMEOUT_MS);

  try {
    const fetchOptions: any = { signal: abortController.signal };

    if (process.env.FIXIE_URL) {
      fetchOptions.dispatcher = new ProxyAgent(process.env.FIXIE_URL);
    }


    const response = await nodeFetch(url.toString(), fetchOptions);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      // Log the full error for debugging, but return a generic message to the client
      console.error(`Genderize API returned non-OK status: ${response.status} - ${errorText}`);
      throw new ApiError('Genderize API returned non-OK status', 502);
    }

    const data = await response.json() as GenderizeResponse;

    // Check for inconclusive prediction BEFORE transformations
    if (data.gender === null || data.count === 0) {
      throw new NoPredictionError('No prediction available for the provided name');
    }

    // Apply transformations
    const sample_size = data.count;
    const is_confident = data.probability !== null && data.probability >= 0.7 && sample_size >= 100;
    const processed_at = new Date().toISOString();

    return {
      name: data.name,
      gender: data.gender,
      probability: data.probability,
      sample_size: sample_size,
      is_confident: is_confident,
      processed_at: processed_at,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId); // Ensure timeout is cleared even on error

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(`Genderize API request timed out after ${GENDERIZE_API_TIMEOUT_MS}ms`, 504); // 504 Gateway Timeout
    }

    if (error instanceof ApiError || error instanceof NoPredictionError) {
      throw error; // Re-throw our custom errors
    } else if (error instanceof Error) {
      throw new ApiError(`Failed to fetch from Genderize API: ${error.message}`, 502);
    } else {
      throw new ApiError(`An unknown error occurred while fetching from Genderize API: ${String(error)}`, 502);
    }
  }
};