export interface WorldLocalization {
  name: string;
  tagline: string;
  listenAction: string;
}

export const BRAND_NAMES: Record<string, string> = {
  Kannada: 'ಸ್ವರ ಲೋಕ',
  Hindi: 'स्वर लोक',
  Tamil: 'ஸ்வர லோகா',
  Telugu: 'స్వర లోకం',
  Malayalam: 'സ്വര ലോകം',
  English: 'Swara Loka',
  All: 'Swara Loka',
};

export function getBrandName(language = 'Kannada'): string {
  return BRAND_NAMES[language] || BRAND_NAMES['Kannada'];
}

export const WORLD_TRANSLATIONS: Record<string, Record<string, WorldLocalization>> = {
  'ksrtc-bus': {
    Kannada: {
      name: 'ಕೆ.ಎಸ್.ಆರ್.ಟಿ.ಸಿ ರಾತ್ರಿ ಬಸ್',
      tagline: 'ಕಿಟಕಿ ಬದಿಯ ಸೀಟು, ರೇಡಿಯೋದಲ್ಲಿ ಎಸ್.ಪಿ.ಬಿ ಗಾನ.',
      listenAction: 'ಕೇಳಿ',
    },
    Hindi: {
      name: 'विंटेज केएसआरटीसी नाइट बस',
      tagline: 'खिड़की वाली सीट, रात का सुहाना विंटेज सफर.',
      listenAction: 'सुनिए',
    },
    Tamil: {
      name: 'வின்டேஜ் கேஎஸ்ஆர்டிசி பேருந்து',
      tagline: 'ஜன்னலோர இருக்கை, எஸ்பிபி & இளையராஜா பாடல்கள்.',
      listenAction: 'கேளுங்கள்',
    },
    Telugu: {
      name: 'వింటేజ్ KSRTC నైట్ బస్సు',
      tagline: 'కిటికీ పక్క సీటు, ఎస్పీబీ & ఇళయరాజా మధుర గీతాలు.',
      listenAction: 'వినండి',
    },
    Malayalam: {
      name: 'വിന്റേജ് കെഎസ്ആർടിസി ബസ്',
      tagline: 'ജനലരികിലെ സീറ്റിലിരുന്ന് ഒരു രാത്രി യാത്ര.',
      listenAction: 'കേൾക്കൂ',
    },
    English: {
      name: 'Vintage KSRTC Express',
      tagline: 'Window seat nostalgia. Timeless 80s & 90s golden classics.',
      listenAction: 'Listen',
    },
    All: {
      name: 'Vintage KSRTC Express',
      tagline: 'Window seat nostalgia. Timeless golden classics across languages.',
      listenAction: 'Play',
    },
  },
  'temple-morning': {
    Kannada: {
      name: 'ದೇವಾಲಯದ ಬೆಳಗು',
      tagline: 'ಮುಂಜಾನೆಯ ಪವಿತ್ರ ಪ್ರಶಾಂತತೆ, ಭಕ್ತಿಯ ಸ್ವರ ಲಹರಿ.',
      listenAction: 'ಕೇಳಿ',
    },
    Hindi: {
      name: 'मंदिर की पावन सुबह',
      tagline: 'पवित्र भोर की शांति, भक्ति और शास्त्रीय रागों का संगम.',
      listenAction: 'सुनिए',
    },
    Tamil: {
      name: 'கோவில் விடியல் காலை',
      tagline: 'அதிகாலை அமைதி, பக்தி ராகங்கள் மற்றும் மந்திரங்கள்.',
      listenAction: 'கேளுங்கள்',
    },
    Telugu: {
      name: 'దేవాలయ ప్రశాంత ఉదయమ్',
      tagline: 'ముకుళిత హృదయంతో పవిత్ర ప్రార్థనలు, భక్తి స్వరాలు.',
      listenAction: 'వినండి',
    },
    Malayalam: {
      name: 'ക്ഷേത്ര പ്രഭാതം',
      tagline: 'പുലർകാല ശാന്തത, മന്ത്രങ്ങളും ഭക്തിഗാനങ്ങളും.',
      listenAction: 'കേൾക്കൂ',
    },
    English: {
      name: 'Temple Sacred Dawn',
      tagline: 'Sacred dawn, temple bells & peaceful devotional ragas.',
      listenAction: 'Listen',
    },
    All: {
      name: 'Sacred Temple Dawn',
      tagline: 'Meditative classical prayers & spiritual solace.',
      listenAction: 'Play',
    },
  },
  'coastal-morning': {
    Kannada: {
      name: 'ಕರಾವಳಿ ಮುಂಜಾನೆ',
      tagline: 'ಕಡಲ ಅಲೆಗಳ ತಟದಲ್ಲಿ, ಮೌನದ ಮಧುರ ಸ್ವರ.',
      listenAction: 'ಕೇಳಿ',
    },
    Hindi: {
      name: 'समुद्र तट की सुबह',
      tagline: 'लहरों की गूंज और सुकून भरी सुबह की धुनें.',
      listenAction: 'सुनिए',
    },
    Tamil: {
      name: 'கடற்கரை விடியல்',
      tagline: 'அலைகளின் சத்தம், இதமான காலை மெல்லிசை.',
      listenAction: 'கேளுங்கள்',
    },
    Telugu: {
      name: 'తీరప్రాంత ఉదయమ్',
      tagline: 'సముద్రపు అలల సవ్వడి, ప్రశాంతమైన అకౌస్టిక్ గీతాలు.',
      listenAction: 'వినండి',
    },
    Malayalam: {
      name: 'തീരദേശ പ്രഭാതം',
      tagline: 'കടൽത്തിരകളുടെ താളം, ശാന്തമായ മെലഡികൾ.',
      listenAction: 'കേൾക്കൂ',
    },
    English: {
      name: 'Coastal Morning',
      tagline: 'Gentle ocean waves & peaceful acoustic solitude.',
      listenAction: 'Listen',
    },
    All: {
      name: 'Coastal Sunrise Solitude',
      tagline: 'Breezy acoustic melodies & ocean horizon.',
      listenAction: 'Play',
    },
  },
  'malnad-bus': {
    Kannada: {
      name: 'ಮಲೆನಾಡು ಬಸ್ ಪಯಣ',
      tagline: 'ಕಿಟಕಿಯಾಚೆ ಮಳೆ ಹನಿಗಳು, ಬಸ್ಸಿನಲ್ಲಿ ಇಂಪಾದ ಗಾನ.',
      listenAction: 'ಕೇಳಿ',
    },
    Hindi: {
      name: 'मल्नाड बारिश का सफर',
      tagline: 'कांच पर बारिश की बूंदें, सदाबहार रोमांटिक धुनें.',
      listenAction: 'सुनिए',
    },
    Tamil: {
      name: 'மலைப்பாதை மழைப் பேருந்து',
      tagline: 'மழைத்துளிகள் வழியும் ஜன்னல், மனதை மயக்கும் மெலடிகள்.',
      listenAction: 'கேளுங்கள்',
    },
    Telugu: {
      name: 'వర్షపు బస్సు ప్రయాణం',
      tagline: 'కిటికీపై వర్షపు చినుకులు, హృదయాన్ని తాకే శ్రావ్యమైన పాటలు.',
      listenAction: 'వినండి',
    },
    Malayalam: {
      name: 'മഴ ബസ് യാത്ര',
      tagline: 'ജനലിൽ തഴുകുന്ന മഴത്തുള്ളികൾ, മനോഹര ഗാനങ്ങൾ.',
      listenAction: 'കേൾക്കൂ',
    },
    English: {
      name: 'Malnad Rain Journey',
      tagline: 'Rain on bus window & romantic monsoon melodies.',
      listenAction: 'Listen',
    },
    All: {
      name: 'Monsoon Rain Bus Journey',
      tagline: 'Atmospheric evergreen rain melodies across languages.',
      listenAction: 'Play',
    },
  },
  'universal-mode': {
    Kannada: {
      name: 'ವಿಶ್ವ ಸಂಗೀತ ಲೋಕ (Universal)',
      tagline: 'ಎಲ್ಲಾ ಭಾಷೆ, ಮೂಡ್ & ಅನಂತ ಗಾನ.',
      listenAction: 'ಕೇಳಿ',
    },
    Hindi: {
      name: 'यूनिवर्सल म्यूजिक लाउंज',
      tagline: 'सभी भाषाएं, लो-फाइ और असीमित संगीत प्रवाह.',
      listenAction: 'सुनिए',
    },
    Tamil: {
      name: 'யுனிவர்சல் மியூசிக் லவுஞ்ச்',
      tagline: 'அனைத்து மொழிகள், லோ-ஃபை மற்றும் எல்லையற்ற இசை.',
      listenAction: 'கேளுங்கள்',
    },
    Telugu: {
      name: 'విశ్వ సంగీత లోకం (Universal)',
      tagline: 'అన్ని భాషలు, లో-ఫై & అనంతమైన సంగీత తరంగాలు.',
      listenAction: 'వినండి',
    },
    Malayalam: {
      name: 'യൂണിവേഴ്സൽ മ്യൂസിക് ലോഞ്ച്',
      tagline: 'എല്ലാ ഭാഷകളും, ലോ-ഫൈയും അനന്തമായ സംഗീതവും.',
      listenAction: 'കേൾക്കൂ',
    },
    English: {
      name: 'Universal Cyber Lounge',
      tagline: 'All languages, lo-fi beats & multi-genre live stream.',
      listenAction: 'Listen',
    },
    All: {
      name: 'Universal Music Hub',
      tagline: 'Unlimited multi-language audio stream & chill beats.',
      listenAction: 'Play',
    },
  },
};

export function getLocalizedWorld(worldId: string, language: string): WorldLocalization {
  const worldMap = WORLD_TRANSLATIONS[worldId];
  if (!worldMap) {
    return {
      name: worldId,
      tagline: 'Ambient Music Experience',
      listenAction: 'Listen',
    };
  }
  return worldMap[language] || worldMap['Kannada'] || worldMap['English'];
}
