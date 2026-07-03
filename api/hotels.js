/**
 * Hotel Search API Integration
 * Aggregates hotel search from multiple providers
 * Supports Booking.com, Agoda, and custom providers
 */

async function searchHotels(query) {
    // Query should contain: destination, checkIn, checkOut, guests, rooms
    const bookingKey = process.env.BOOKING_API_KEY;
    const agodaKey = process.env.AGODA_API_KEY;

    if (!bookingKey && !agodaKey) {
        return {
            error: "No hotel API credentials configured",
            configured: false
        };
    }

    const results = [];

    // Try Booking.com if configured
    if (bookingKey) {
        try {
            const bookingResults = await searchBooking(query, bookingKey);
            results.push(...bookingResults);
        } catch (error) {
            console.error("Booking.com search failed:", error.message);
        }
    }

    // Try Agoda if configured
    if (agodaKey) {
        try {
            const agodaResults = await searchAgoda(query, agodaKey);
            results.push(...agodaResults);
        } catch (error) {
            console.error("Agoda search failed:", error.message);
        }
    }

    // Sort by price and return top results
    const sorted = results
        .sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0))
        .slice(0, 10);

    return {
        source: "hotels_aggregated",
        hotels: sorted,
        configured: bookingKey || agodaKey ? true : false
    };
}

async function searchBooking(query, apiKey) {
    // Placeholder for Booking.com API integration
    // Requires API key and proper authentication
    try {
        const response = await fetch("https://api.booking.com/v1/hotels/search", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                location: query.destination,
                checkInDate: query.checkIn,
                checkOutDate: query.checkOut,
                numberOfRooms: query.rooms || 1,
                numberOfGuests: query.guests || 1
            })
        });

        if (!response.ok) {
            throw new Error(`Booking.com API error: ${response.status}`);
        }

        const data = await response.json();
        return normalizeBookingResults(data.hotels || []);
    } catch (error) {
        console.error("Booking.com search error:", error);
        return [];
    }
}

async function searchAgoda(query, apiKey) {
    // Placeholder for Agoda API integration
    try {
        const response = await fetch("https://api.agoda.com/properties/search", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                destination: query.destination,
                checkInDate: query.checkIn,
                checkOutDate: query.checkOut,
                numberOfRooms: query.rooms || 1,
                numberOfAdults: query.guests || 1
            })
        });

        if (!response.ok) {
            throw new Error(`Agoda API error: ${response.status}`);
        }

        const data = await response.json();
        return normalizeAgodaResults(data.properties || []);
    } catch (error) {
        console.error("Agoda search error:", error);
        return [];
    }
}

function normalizeBookingResults(hotels) {
    // Normalize Booking.com results to standard format
    return hotels.map(hotel => ({
        id: hotel.id,
        name: hotel.name || "",
        destination: hotel.location?.address || "",
        pricePerNight: hotel.price?.amount || null,
        currency: hotel.price?.currency || "USD",
        rating: hotel.rating || 0,
        reviewCount: hotel.reviewCount || 0,
        imageUrl: hotel.images?.[0]?.url || "",
        checkIn: hotel.checkInDate || "",
        checkOut: hotel.checkOutDate || "",
        source: "booking",
        handoffUrl: hotel.deepLink || ""
    }));
}

function normalizeAgodaResults(properties) {
    // Normalize Agoda results to standard format
    return properties.map(property => ({
        id: property.id,
        name: property.name || "",
        destination: property.address || "",
        pricePerNight: property.pricePerRoom || null,
        currency: property.currency || "USD",
        rating: property.starRating || 0,
        reviewCount: property.numberOfReviews || 0,
        imageUrl: property.mainImage?.url || "",
        checkIn: property.checkInDate || "",
        checkOut: property.checkOutDate || "",
        source: "agoda",
        handoffUrl: property.deepLink || ""
    }));
}

module.exports = {
    searchHotels,
    searchBooking,
    searchAgoda,
    normalizeBookingResults,
    normalizeAgodaResults
};
