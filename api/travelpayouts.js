/**
 * TravelPayouts Flights & Hotels API Integration
 * Handles flight deals, price predictions, and aggregated results
 */

async function searchFlights(query) {
    const apiKey = process.env.TRAVELPAYOUTS_API_KEY;
    const token = process.env.TRAVELPAYOUTS_TOKEN;

    if (!apiKey || !token) {
        return {
            error: "TravelPayouts credentials not configured",
            configured: false
        };
    }

    try {
        const params = new URLSearchParams({
            origin: query.origin,
            destination: query.destination,
            departure_at: query.departureDate,
            return_at: query.returnDate || undefined,
            adults: query.adults || 1,
            children: query.children || 0,
            infants: query.infants || 0,
            token: token
        });

        const response = await fetch(`https://api.travelpayouts.com/v2/search?${params}`, {
            method: "GET",
            headers: {
                "X-Access-Token": apiKey,
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`TravelPayouts API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            source: "travelpayouts",
            trips: normalizeTravelPayoutsResults(data.data || []),
            configured: true
        };
    } catch (error) {
        return {
            error: error.message,
            configured: true
        };
    }
}

async function getPricePrediction(origin, destination, departureDate) {
    // Predict whether flight prices will go up or down
    const token = process.env.TRAVELPAYOUTS_TOKEN;

    if (!token) {
        return {
            error: "TravelPayouts token not configured",
            configured: false
        };
    }

    try {
        const response = await fetch(
            `https://api.travelpayouts.com/v2/prices/predictions?origin=${origin}&destination=${destination}&departure_at=${departureDate}&token=${token}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Price prediction API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            source: "travelpayouts_prediction",
            prediction: data.prediction || "unknown",
            trend: data.trend || null,
            configured: true
        };
    } catch (error) {
        return {
            error: error.message,
            configured: true
        };
    }
}

function normalizeTravelPayoutsResults(flights) {
    // Normalize TravelPayouts response to standard format
    return flights.slice(0, 6).map(flight => ({
        id: flight.flight_number || flight.id,
        price: flight.price,
        currency: flight.currency || "USD",
        providerName: flight.airline || "TravelPayouts",
        providerType: "ota",
        handoffUrl: flight.deep_link || "",
        refundable: false,
        exchangeable: false,
        route: {
            originCode: flight.origin || "",
            destinationCode: flight.destination || "",
            originCity: "",
            destinationCity: ""
        },
        outbound: {
            departureTime: flight.departure_at || "",
            arrivalTime: flight.return_at || "",
            duration: "",
            stops: 0,
            airline: flight.airline || ""
        },
        inbound: null
    }));
}

module.exports = {
    searchFlights,
    getPricePrediction,
    normalizeTravelPayoutsResults
};
