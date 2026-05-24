import { rtdb } from './firebaseClient';
import { ref, get } from 'firebase/database';

export const ADJECTIVES = [
    'Stealthy', 'Neon', 'Rapid', 'Silent', 'Golden', 'Shadowy', 'Cyber', 'Arctic', 'Mystic', 'Cosmic',
    'Brave', 'Cunning', 'Swift', 'Lucky', 'Iron', 'Velvet', 'Midnight', 'Hyper', 'Nova', 'Electric'
];

export const NOUNS = [
    'Fox', 'Tiger', 'Panda', 'Phoenix', 'Falcon', 'Ghost', 'Knight', 'Spectre', 'Viper', 'Drake',
    'Wolf', 'Breeze', 'Storm', 'Shadow', 'Hunter', 'Edge', 'Prism', 'Spark', 'Zenith', 'Nebula'
];

export interface UserIdentity {
    name: string;
    countryCode: string; // ISO 3166-1 alpha-2 (e.g. US)
    countryInitial: string; // ISO 3166-1 alpha-3 (e.g. USA)
    country: string;
    flag: string;
    karma?: number;
    title?: string;
    ageRange?: string;
}

export function generateRandomName(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    // Randomly decide if one or two words (50/50 chance)
    return Math.random() > 0.5 ? `${adj} ${noun}` : noun;
}

export function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export function getTitleByKarma(karma: number): string {
    if (karma >= 500) return 'Divine Vibe';
    if (karma >= 200) return 'Legendary Stranger';
    if (karma >= 100) return 'The Philosopher';
    if (karma >= 50) return 'Vibe Master';
    if (karma >= 20) return 'Regular';
    return 'Newcomer';
}

// Helper to map 2-letter code to 3-letter initials where possible
export function getCountryInitials(code: string): string {
    const map: Record<string, string> = {
        'US': 'USA', 'GB': 'GBR', 'CA': 'CAN', 'AU': 'AUS', 'DE': 'DEU', 'FR': 'FRA', 'IN': 'IND',
        'CN': 'CHN', 'JP': 'JPN', 'BR': 'BRA', 'RU': 'RUS', 'ES': 'ESP', 'IT': 'ITA', 'MX': 'MEX',
        'ID': 'IDN', 'PK': 'PAK', 'NG': 'NGA', 'BD': 'BGD', 'TR': 'TUR', 'VN': 'VNM'
    };
    const upperCode = code.toUpperCase();
    return map[upperCode] || (upperCode.length === 2 ? upperCode + '?' : upperCode);
}

// Helper to map 2-letter code to country name
export function getCountryName(code: string): string {
    const names: Record<string, string> = {
        'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
        'DE': 'Germany', 'FR': 'France', 'IN': 'India', 'CN': 'China', 'JP': 'Japan',
        'BR': 'Brazil', 'RU': 'Russia', 'ES': 'Spain', 'IT': 'Italy', 'MX': 'Mexico',
        'ID': 'Indonesia', 'PK': 'Pakistan', 'NG': 'Nigeria', 'BD': 'Bangladesh',
        'TR': 'Turkey', 'VN': 'Vietnam'
    };
    return names[code.toUpperCase()] || 'Global Match';
}

export async function detectIdentity(userId?: string): Promise<UserIdentity> {
    let karma = 0;
    if (userId) {
        try {
            const statsRef = ref(rtdb, `users_stats/${userId}/karma`);
            const snapshot = await get(statsRef);
            if (snapshot.exists()) {
                karma = snapshot.val() || 0;
            }
        } catch (e) {
            console.warn('Karma fetch failed:', e);
        }
    }

    const defaultIdentity = {
        name: generateRandomName(),
        countryCode: 'UN',
        countryInitial: 'GLO',
        country: 'Global Match',
        flag: '🌐',
        karma: karma,
        title: getTitleByKarma(karma),
        ageRange: '18-24'
    };

    try {
        // Primary API: freeipapi (CORS-friendly, free, modern)
        const response = await fetch('https://freeipapi.com/api/json');
        if (!response.ok) throw new Error('freeipapi failed');
        const data = await response.json();
        
        const countryCode = data.countryCode || 'UN';
        return {
            ...defaultIdentity,
            countryCode: countryCode,
            countryInitial: getCountryInitials(countryCode),
            country: data.countryName || getCountryName(countryCode),
            flag: countryCode && countryCode !== 'UN' ? getFlagEmoji(countryCode) : '🌐',
        };
    } catch (error) {
        try {
            // Secondary fallback API: country.is (CORS-friendly, returns just country code)
            const fallback = await fetch('https://api.country.is/');
            if (!fallback.ok) throw new Error('country.is failed');
            const fData = await fallback.json();
            const countryCode = fData.country || 'UN';
            return {
                ...defaultIdentity,
                countryCode: countryCode,
                countryInitial: getCountryInitials(countryCode),
                country: getCountryName(countryCode),
                flag: countryCode && countryCode !== 'UN' ? getFlagEmoji(countryCode) : '🌐',
            };
        } catch (fError) {
            console.warn('All Geo-IP Detections failed (likely blocked by adblocker):', fError);
            return defaultIdentity;
        }
    }
}
