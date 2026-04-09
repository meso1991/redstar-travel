const hotelResultsTranslations = {
    en: {
        eyebrow: 'Hotel Search',
        title: 'Compare hotel options from your booking partners.',
        subtitle: 'Use the links below to open the same search on Booking.com and Agoda.',
        summary: 'Hotel Search Summary',
        guests: 'Guests',
        rooms: 'Rooms',
        bookingTitle: 'Booking.com',
        bookingText: 'Strong global inventory with hotels, apartments, and family stays.',
        agodaTitle: 'Agoda',
        agodaText: 'Useful for city stays and regional hotel deals across many destinations.',
        openBooking: 'Open Booking.com',
        openAgoda: 'Open Agoda',
        noQuery: 'Missing hotel search details. Please go back and search again.'
    },
    ar: {
        eyebrow: 'بحث فنادق',
        title: 'قارن خيارات الفنادق من شركاء الحجز.',
        subtitle: 'استخدم الروابط أدناه لفتح نفس البحث على Booking.com وAgoda.',
        summary: 'ملخص بحث الفنادق',
        guests: 'الضيوف',
        rooms: 'الغرف',
        bookingTitle: 'Booking.com',
        bookingText: 'خيارات قوية عالميًا للفنادق والشقق والإقامات العائلية.',
        agodaTitle: 'Agoda',
        agodaText: 'مفيد لإقامات المدن والعروض الفندقية في وجهات كثيرة.',
        openBooking: 'فتح Booking.com',
        openAgoda: 'فتح Agoda',
        noQuery: 'بيانات بحث الفنادق ناقصة. عد وابدأ البحث من جديد.'
    }
};

function getHotelResultsLang() {
    return localStorage.getItem('redstar_lang') || 'en';
}

function getHotelSearchParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        destination: params.get('destination') || '',
        checkin: params.get('checkin') || '',
        checkout: params.get('checkout') || '',
        guests: params.get('guests') || '2',
        rooms: params.get('rooms') || '1'
    };
}

function buildHotelSearchLinks(query) {
    const bookingUrl = new URL('https://www.booking.com/searchresults.html');
    bookingUrl.searchParams.set('ss', query.destination);
    bookingUrl.searchParams.set('checkin', query.checkin);
    bookingUrl.searchParams.set('checkout', query.checkout);
    bookingUrl.searchParams.set('group_adults', query.guests);
    bookingUrl.searchParams.set('no_rooms', query.rooms);

    const agodaUrl = new URL('https://www.agoda.com/search');
    agodaUrl.searchParams.set('city', query.destination);
    agodaUrl.searchParams.set('checkIn', query.checkin);
    agodaUrl.searchParams.set('checkOut', query.checkout);
    agodaUrl.searchParams.set('adults', query.guests);
    agodaUrl.searchParams.set('rooms', query.rooms);

    return {
        booking: bookingUrl.toString(),
        agoda: agodaUrl.toString()
    };
}

function initHotelResultsPage() {
    if (document.body.dataset.page !== 'hotel_results') {
        return;
    }

    const lang = getHotelResultsLang();
    const t = hotelResultsTranslations[lang];
    const query = getHotelSearchParams();

    document.getElementById('hotelResultsEyebrow').textContent = t.eyebrow;
    document.getElementById('hotelResultsTitle').textContent = t.title;
    document.getElementById('hotelResultsSubtitle').textContent = t.subtitle;

    const summary = document.getElementById('hotelSearchSummary');
    const grid = document.getElementById('hotelResultsGrid');

    if (!query.destination || !query.checkin || !query.checkout) {
        summary.innerHTML = `<h2>${t.noQuery}</h2>`;
        grid.innerHTML = '';
        return;
    }

    const links = buildHotelSearchLinks(query);

    summary.innerHTML = `
        <span class="kicker">${t.summary}</span>
        <h2>${query.destination}</h2>
        <div class="meta-row">
            <span>${query.checkin} - ${query.checkout}</span>
            <span>${t.guests}: ${query.guests}</span>
            <span>${t.rooms}: ${query.rooms}</span>
        </div>
    `;

    grid.innerHTML = `
        <article class="detail-card">
            <h3>${t.bookingTitle}</h3>
            <p>${t.bookingText}</p>
            <div class="hero-actions">
                <a class="button button-primary" href="${links.booking}" target="_blank" rel="noopener noreferrer">${t.openBooking}</a>
            </div>
        </article>
        <article class="detail-card">
            <h3>${t.agodaTitle}</h3>
            <p>${t.agodaText}</p>
            <div class="hero-actions">
                <a class="button button-primary" href="${links.agoda}" target="_blank" rel="noopener noreferrer">${t.openAgoda}</a>
            </div>
        </article>
    `;
}

document.addEventListener('DOMContentLoaded', initHotelResultsPage);
document.addEventListener('redstar:language-changed', initHotelResultsPage);
