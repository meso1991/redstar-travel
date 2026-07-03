/**
 * AviationStack Flight Data API Integration
 * Provides real-time flight tracking, airline info, and aircraft data
 */

async function getFlightData(flightIATA) {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;

    if (!apiKey) {
        return {
            error: "AviationStack API key not configured",
            configured: false
        };
    }

    try {
        const params = new URLSearchParams({
            access_key: apiKey,
            flight_iata: flightIATA
        });

        const response = await fetch(`http://api.aviationstack.com/v1/flights?${params}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`AviationStack API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            source: "aviationstack",
            flights: data.data || [],
            configured: true
        };
    } catch (error) {
        return {
            error: error.message,
            configured: true
        };
    }
}

async function getAirlineData(airlineIATA) {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;

    if (!apiKey) {
        return {
            error: "AviationStack API key not configured",
            configured: false
        };
    }

    try {
        const params = new URLSearchParams({
            access_key: apiKey,
            airline_iata: airlineIATA
        });

        const response = await fetch(`http://api.aviationstack.com/v1/airlines?${params}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`AviationStack API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            source: "aviationstack",
            airline: data.data?.[0] || null,
            configured: true
        };
    } catch (error) {
        return {
            error: error.message,
            configured: true
        };
    }
}

async function getAircraftData(aircraftIATA) {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;

    if (!apiKey) {
        return {
            error: "AviationStack API key not configured",
            configured: false
        };
    }

    try {
        const params = new URLSearchParams({
            access_key: apiKey,
            aircraft_iata: aircraftIATA
        });

        const response = await fetch(`http://api.aviationstack.com/v1/aircrafts?${params}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`AviationStack API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            source: "aviationstack",
            aircraft: data.data?.[0] || null,
            configured: true
        };
    } catch (error) {
        return {
            error: error.message,
            configured: true
        };
    }
}

async function searchFlights(query) {
    // Search for flights by departure/arrival airports and dates
    const apiKey = process.env.AVIATIONSTACK_API_KEY;

    if (!apiKey) {
        return {
            error: "AviationStack API key not configured",
            configured: false
        };
    }

    try {
        const params = new URLSearchParams({
            access_key: apiKey,
            dep_iata: query.origin,
            arr_iata: query.destination,
            flight_date: query.departureDate
        });

        const response = await fetch(`http://api.aviationstack.com/v1/flights?${params}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`AviationStack API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            source: "aviationstack",
            flights: normalizeFlightResults(data.data || []),
            configured: true
        };
    } catch (error) {
        return {
            error: error.message,
            configured: true
        };
    }
}

function normalizeFlightResults(flights) {
    // Normalize AviationStack flight data to standard format
    return flights.slice(0, 10).map(flight => {
        const departure = flight.departure || {};
        const arrival = flight.arrival || {};
        const aircraft = flight.aircraft || {};
        const airline = flight.airline || {};

        return {
            id: flight.flight?.iata || flight.id,
            flightNumber: flight.flight?.iata || "",
            airline: airline.name || airline.iata || "Unknown Airline",
            airlineIATA: airline.iata || "",
            aircraft: aircraft.model_text || aircraft.model || "Unknown Aircraft",
            aircraftIATA: aircraft.iata || "",
            status: flight.flight_status || "unknown",
            departure: {
                airport: departure.airport || "",
                iata: departure.iata || "",
                icao: departure.icao || "",
                terminal: departure.terminal || "",
                gate: departure.gate || "",
                time: departure.scheduled || departure.estimated || "",
                actualTime: departure.actual || ""
            },
            arrival: {
                airport: arrival.airport || "",
                iata: arrival.iata || "",
                icao: arrival.icao || "",
                terminal: arrival.terminal || "",
                gate: arrival.gate || "",
                time: arrival.scheduled || arrival.estimated || "",
                actualTime: arrival.actual || ""
            },
            duration: calculateDuration(departure.scheduled, arrival.scheduled),
            updated: flight.flight_date || ""
        };
    });
}

function calculateDuration(departureTime, arrivalTime) {
    if (!departureTime || !arrivalTime) return "";

    try {
        const dep = new Date(departureTime);
        const arr = new Date(arrivalTime);
        const diffMs = arr - dep;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    } catch (error) {
        return "";
    }
}

module.exports = {
    getFlightData,
    getAirlineData,
    getAircraftData,
    searchFlights,
    normalizeFlightResults,
    calculateDuration
};
