import { supabase } from './supabaseClient';

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

export async function detectIdentity(userId?: string): Promise<UserIdentity> {
    let karma = 0;
    if (userId) {
        try {
            const { data } = await supabase
                .from('users_stats')
                .select('karma')
                .eq('id', userId)
                .maybeSingle();
            karma = data?.karma || 0;
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
        // Primary API with CORS handled typically
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('ipapi failed');
        const data = await response.json();
        
        return {
            ...defaultIdentity,
            countryCode: data.country_code || 'UN',
            countryInitial: data.country_code_iso3 || getCountryInitials(data.country_code || 'UN'),
            country: data.country_name || 'Global Match',
            flag: data.country_code ? getFlagEmoji(data.country_code) : '🌐',
        };
    } catch (error) {
        try {
            // Secondary fallback API
            const fallback = await fetch('https://ipwho.is/');
            const fData = await fallback.json();
            return {
                ...defaultIdentity,
                countryCode: fData.country_code || 'UN',
                countryInitial: fData.country_code_iso3 || getCountryInitials(fData.country_code || 'UN'),
                country: fData.country || 'Global Match',
                flag: fData.country_code ? getFlagEmoji(fData.country_code) : '🌐',
            };
        } catch (fError) {
            console.warn('All Geo-IP Detections failed (likely blocked by adblocker):', fError);
            return defaultIdentity;
        }
    }
}
