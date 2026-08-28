// services/google/geocodingService.ts
import { RouteCoordinate } from '../firebase/group-service';

interface GeocodeResponse {
    results: Array<{
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
        formatted_address: string;
    }>;
    status: string;
}

export const GeocodingService = {
    /**
     * Converte um endereço de texto em coordenadas geográficas usando a Google Geocoding API
     */
    async getCoordinatesFromAddress(
        address: string,
        apiKey: string
    ): Promise<{ location: RouteCoordinate; formattedAddress: string }> {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

        const response = await fetch(url);
        const data: GeocodeResponse = await response.json();

        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            throw new Error(`Endereço não encontrado ou inválido: ${data.status}`);
        }

        const result = data.results[0];
        return {
            location: {
                latitude: result.geometry.location.lat,
                longitude: result.geometry.location.lng,
            },
            formattedAddress: result.formatted_address,
        };
    },
};