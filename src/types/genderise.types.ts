/**
 * Represents the raw response from the Genderize.io API.
 */
export interface GenderizeResponse {
  count: number;
  name: string;
  gender: string | null;
  probability: number | null;
}

/**
 * Represents the transformed gender prediction data returned to the client.
 */
export interface TransformedGenderizeResponse {
  name: string;
  gender: string | null;
  probability: number | null;
  sample_size: number;
  is_confident: boolean;
  processed_at: string;
}