const hotelResultsTranslations = {
    en: {
        eyebrow: 'Hotel Search',
        title: 'Compare hotel options from your booking partners.',
        subtitle: 'Use the links below to open the same search on Booking.com and Agoda, or book directly with RedStar.',
        summary: 'Hotel Search Summary',
        guests: 'Guests',
        rooms: 'Rooms',
        bookingTitle: 'Booking.com',
        bookingText: 'Strong global inventory with hotels, apartments, and family stays.',
        agodaTitle: 'Agoda',
        agodaText: 'Useful for city stays and regional hotel deals across many destinations.',
        openBooking: 'Open Booking.com',
        openAgoda: 'Open Agoda',
        bookWithRedStar: 'Book with RedStar (WhatsApp)',
        noQuery: 'Missing hotel search details. Please go back and search again.'
    },
    ar: {
        eyebrow: 'بحث فنادق',
        title: 'قارن خيارات الفنادق من شركاء الحجز.',
        subtitle: 'استخدم الروابط أدناه لفتح نفس البحث على Booking.com وAgoda، أو احجز مباشرة مع ريدستار.',
        summary: 'ملخص بحث الفنادق',
        guests: 'الضيوف',
        rooms: 'الغرف',
        bookingTitle: 'Booking.com',
        bookingText: 'خيارات قوية عالميًا للفنادق والشقق والإقامات العائلية.',
        agodaTitle: 'Agoda',
        agodaText: 'مفيد لإقامات المدن والعروض الفندقية في وجهات كثيرة.',
        openBooking: 'فتح Booking.com',
        openAgoda: 'فتح Agoda',
        bookWithRedStar: 'احجز مع ريدستار (واتساب)',
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

function buildHotelWhatsAppMessage(query) {
    const checkInDate = new Date(query.checkin);
    const checkOutDate = new Date(query.checkout);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    let message = `🏨 *Hotel Booking Request*\n\n`;
    message += `📍 Destination: ${query.destination}\n`;
    message += `📅 Check-in: ${query.checkin}\n`;
    message += `📅 Check-out: ${query.checkout}\n`;
    message += `🌙 Nights: ${nights}\n`;
    message += `🛏️ Rooms: ${query.rooms}\n`;
    message += `👥 Guests: ${query.guests}\n\n`;
    message += `Please help me find the best hotel option for my stay.`;
    
    return message;
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
    const whatsappMessage = buildHotelWhatsAppMessage(query);

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
            <div class="hero-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a class="button button-primary" href="${links.booking}" target="_blank" rel="noopener noreferrer">${t.openBooking}</a>
                <button class="button button-secondary" type="button" onclick="sendHotelToWhatsApp('${whatsappMessage.replace(/'/g, "\\'")}'); return false;">${t.bookWithRedStar}</button>
            </div>
        </article>
        <article class="detail-card">
            <h3>${t.agodaTitle}</h3>
            <p>${t.agodaText}</p>
            <div class="hero-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a class="button button-primary" href="${links.agoda}" target="_blank" rel="noopener noreferrer">${t.openAgoda}</a>
                <button class="button button-secondary" type="button" onclick="sendHotelToWhatsApp('${whatsappMessage.replace(/'/g, "\\'")}'); return false;">${t.bookWithRedStar}</button>
            </div>
        </article>
    `;
}

document.addEventListener('DOMContentLoaded', initHotelResultsPage);
document.addEventListener('redstar:language-changed', initHotelResultsPage);
