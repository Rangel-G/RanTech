// services/google/directionsService.ts
import { RouteCoordinate } from '../firebase/group-service';

interface DirectionsResponse {
    routes: Array<{
        overview_polyline: {
            points: string;
        };
        legs: Array<{
            end_address: string;
            start_address: string;
        }>;
    }>;
    status: string;
    error_message?: string;
}

/**
 * Decodifica uma string "encoded polyline" do Google em um array de coordenadas { latitude, longitude }
 */
function decodePolyline(encoded: string): RouteCoordinate[] {
    let points: RouteCoordinate[] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        });
    }
    return points;
}

export const DirectionsService = {
    /**
     * Consulta a Google Directions API para obter o traçado detalhado entre origem e destino
     */
    async getRoute(
        origin: RouteCoordinate,
        destination: RouteCoordinate,
        apiKey: string
    ): Promise<{ coordinates: RouteCoordinate[]; endAddress?: string }> {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}&mode=driving`;

        const response = await fetch(url);
        const data: DirectionsResponse = await response.json();

        if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
            throw new Error(`Não foi possível calcular a rota: ${data.error_message || data.status}`);
        }

        const route = data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);
        const endAddress = route.legs?.[0]?.end_address;

        return {
            coordinates: points,
            endAddress,
        };
    },
};