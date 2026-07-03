/**
 * SerpAPI Web Search Integration
 * Handles web search queries via SerpAPI
 */

async function searchWeb(query, searchType = "google") {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
        return {
            error: "SerpAPI key not configured",
            configured: false
        };
    }

    try {
        const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                q: query,
                num: 10,
                type: searchType
            })
        });

        if (!response.ok) {
            throw new Error(`SerpAPI error: ${response.status}`);
        }

        const data = await response.json();
        return {
            source: "serpapi",
            results: normalizeSearchResults(data.organic || []),
            knowledgeGraph: data.knowledgeGraph || null,
            configured: true
        };
    } catch (error) {
        return {
            error: error.message,
            configured: true
        };
    }
}

async function searchDestinationInfo(destination) {
    // Specialized search for destination information
    // Helpful for travel recommendations and guides
    const query = `travel guide ${destination} attractions hotels weather`;
    return searchWeb(query, "google");
}

async function searchFlightDeals(origin, destination) {
    // Search for flight deals information
    const query = `cheap flights ${origin} to ${destination}`;
    return searchWeb(query, "news");
}

function normalizeSearchResults(results) {
    // Normalize search results for frontend consumption
    return results.slice(0, 10).map(result => ({
        title: result.title || "",
        url: result.link || "",
        snippet: result.snippet || "",
        source: new URL(result.link || "").hostname,
        favicon: result.favicon || ""
    }));
}

module.exports = {
    searchWeb,
    searchDestinationInfo,
    searchFlightDeals,
    normalizeSearchResults
};
