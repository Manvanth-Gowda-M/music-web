export interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  sub: string;
  flag: string;
  color: string;
  gradient: string;
}

export interface SongThemeOption {
  id: string;
  title: string;
  nativeTitle: string;
  icon: string;
  tagline: string;
  color: string;
  query: string;
  description: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    id: 'Kannada',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    sub: 'Sandalwood • Classic & Trending',
    flag: '🟡🔴',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-red-500',
  },
  {
    id: 'Hindi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    sub: 'Bollywood • Hits & Melodies',
    flag: '🇮🇳',
    color: '#ef4444',
    gradient: 'from-orange-500 to-rose-600',
  },
  {
    id: 'Tamil',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    sub: 'Kollywood • Anirudh & Rahman',
    flag: '✨',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'Telugu',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    sub: 'Tollywood • Mass & Melodies',
    flag: '🌴',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'Malayalam',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    sub: 'Mollywood • Soulful & Acoustic',
    flag: '🥥',
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'English',
    name: 'English',
    nativeName: 'English',
    sub: 'Global Pop • Billboard Hits',
    flag: '🌍',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'All',
    name: 'All Languages',
    nativeName: 'ವಿಶ್ವ ಗಾನ (Universal)',
    sub: 'Multi-Language Infinite Mix',
    flag: '🌐',
    color: '#ec4899',
    gradient: 'from-pink-500 to-purple-600',
  },
];

export const SONG_THEMES: SongThemeOption[] = [
  {
    id: 'Lofi',
    title: 'Lofi & Rain Chill',
    nativeTitle: 'ಲೋಫೈ & ಮಳೆ ಗಾನ',
    icon: '🌧️',
    tagline: 'Mellow chill, rain ambience & study beats',
    color: '#38bdf8',
    query: 'lofi chill rain relaxing',
    description: 'Slowed reverb & acoustic chill beats for calm focus and relaxation',
  },
  {
    id: 'Party',
    title: 'Party & Dance Banger',
    nativeTitle: 'ಪಾರ್ಟಿ & ಡ್ಯಾನ್ಸ್ ಧಮಾಕಾ',
    icon: '🎉',
    tagline: 'High-tempo club beats & fast dance hits',
    color: '#ec4899',
    query: 'party dance club fast banger',
    description: 'Energetic party anthems to boost your adrenaline and vibe',
  },
  {
    id: 'Devotional',
    title: 'Devotional & Sacred Ragas',
    nativeTitle: 'ಭಕ್ತಿ & ಶಾಂತಿ ತರಂಗ',
    icon: '🛕',
    tagline: 'Soul-cleansing stotras, bhajans & ragas',
    color: '#f59e0b',
    query: 'devotional classical raga bhakti stotra',
    description: 'Sacred classical devotional chants for inner peace and morning meditation',
  },
  {
    id: 'Acoustic',
    title: 'Acoustic & Coffee Chill',
    nativeTitle: 'ಅಕೌಸ್ಟಿಕ್ ಮೆಲೋಡಿ',
    icon: '☕',
    tagline: 'Unplugged guitar, soothing vocals & peace',
    color: '#a855f7',
    query: 'acoustic unplugged calm soft guitar',
    description: 'Intimate unplugged acoustic melodies with stripped-down instruments',
  },
  {
    id: 'Romantic',
    title: 'Romantic & Love Melodies',
    nativeTitle: 'ಪ್ರೇಮ ರಾಗಗಳು',
    icon: '❤️',
    tagline: 'Timeless sweet love songs & deep duets',
    color: '#f43f5e',
    query: 'romantic love melody heartfelt duet',
    description: 'Sweet heart-melting melodies and emotional love tracks',
  },
  {
    id: 'Retro',
    title: 'Golden 80s & 90s Classics',
    nativeTitle: 'ಸುವರ್ಣ ಯುಗದ ಕ್ಲಾಸಿಕ್ಸ್',
    icon: '📻',
    tagline: 'Nostalgic vintage golden era masterpieces',
    color: '#d97706',
    query: 'retro 80s 90s classic evergreen vintage',
    description: 'Timeless golden era melodies and nostalgic childhood memories',
  },
  {
    id: 'Drive',
    title: 'Night Highway Drive',
    nativeTitle: 'ರಾತ್ರಿ ರಸ್ತೆ ಪಯಣ',
    icon: '🚗',
    tagline: 'Smooth cruising beats & highway rhythm',
    color: '#6366f1',
    query: 'night drive highway cruising travel',
    description: 'Atmospheric journey music crafted for long highway drives under the stars',
  },
  {
    id: 'Bass',
    title: 'EDM & Bass Boosted',
    nativeTitle: 'ಹೈ ಎನರ್ಜಿ & ಬಾಸ್',
    icon: '⚡',
    tagline: 'Heavy drops, punchy sub-bass & electronic',
    color: '#10b981',
    query: 'edm bass boosted remix electronic drop',
    description: 'Ultra punchy basslines and electrifying festival energy',
  },
  {
    id: 'Sad',
    title: 'Soulful & Melancholy',
    nativeTitle: 'ಭಾವಪೂರ್ಣ ಸುಮಧುರ',
    icon: '🌙',
    tagline: 'Deeply moving, emotional & poetic',
    color: '#64748b',
    query: 'sad emotional heart touching soulful',
    description: 'Poetic, evocative and emotionally resonant slow compositions',
  },
];
