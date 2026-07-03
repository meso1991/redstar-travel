/**
 * Kiwi Flight Search API Integration
 * Handles flight search via Kiwi.com API
 */

async function searchFlights(query) {
    const apiKey = process.env.KIWI_API_KEY;

    if (!apiKey) {
        return {
            error: "Kiwi API key not configured",
            configured: false
        };
    }

    try {
        const params = new URLSearchParams({
            fly_from: query.origin,
            fly_to: query.destination,
            date_from: query.departureDate,
            date_to: query.departureDate,
            return_from: query.returnDate || undefined,
            return_to: query.returnDate || undefined,
            adults: query.adults || 1,
            children: query.children || 0,
            infants: query.infants || 0,
            curr: "USD",
            limit: 6,
            apikey: apiKey
        });

        const response = await fetch(`https://api.tequila.kiwi.com/v2/search?${params}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Kiwi API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            source: "kiwi",
            trips: normalizeKiwiResults(data.data || []),
            configured: true
        };
    } catch (error) {
        return {
            error: error.message,
            configured: true
        };
    }
}

function normalizeKiwiResults(flights) {
    // Normalize Kiwi response to standard format
    // Extracts relevant information for frontend display
    return flights.slice(0, 6).map(flight => ({
        id: flight.id,
        price: flight.price,
        currency: "USD",
        providerName: "Kiwi.com",
        providerType: "ota",
        handoffUrl: flight.deep_link || "",
        refundable: flight.refundable || false,
        exchangeable: false,
        route: {
            originCode: flight.route?.[0]?.flyFrom || "",
            destinationCode: flight.route?.[0]?.flyTo || "",
            originCity: flight.cityFrom || "",
            destinationCity: flight.cityTo || ""
        },
        outbound: {
            departureTime: new Date(flight.route?.[0]?.dTime * 1000).toISOString(),
            arrivalTime: new Date(flight.route?.[0]?.aTime * 1000).toISOString(),
            duration: `${Math.floor(flight.duration?.total / 3600)}h ${Math.floor((flight.duration?.total % 3600) / 60)}m`,
            stops: flight.route?.[0]?.stops?.length || 0,
            airline: flight.route?.[0]?.airline || ""
        },
        inbound: flight.route?.length > 1 ? {
            departureTime: new Date(flight.route[1]?.dTime * 1000).toISOString(),
            arrivalTime: new Date(flight.route[1]?.aTime * 1000).toISOString(),
            duration: `${Math.floor(flight.route[1]?.duration / 3600)}h ${Math.floor((flight.route[1]?.duration % 3600) / 60)}m`,
            stops: flight.route[1]?.stops?.length || 0,
            airline: flight.route[1]?.airline || ""
        } : null
    }));
}

module.exports = {
    searchFlights,
    normalizeKiwiResults
};
