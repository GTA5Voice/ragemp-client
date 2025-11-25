type Dictionary = {
    error: {
        title: string;
        description: string;
        code: string;
    };
};

const dictionaries: Record<string, Dictionary> = {
    de: {
        error: {
            title: 'GTA5Voice Fehler',
            description: 'Ein unerwarteter Fehler ist aufgetreten.',
            code: 'Fehler-Code',
        },
    },
    en: {
        error: {
            title: 'GTA5Voice Error',
            description: 'An unexpected error occurred.',
            code: 'Error code',
        },
    },
};

export class Translations {
    private lang: keyof typeof dictionaries;

    constructor(lang: string = 'en') {
        this.lang = dictionaries[lang] ? (lang as keyof typeof dictionaries) : 'en';
    }

    translate(key: string): string {
        const parts = key.split('.');
        let value: unknown = dictionaries[this.lang];

        for (const part of parts) {
            if (value && typeof value === 'object' && part in (value as Record<string, unknown>)) {
                value = (value as Record<string, unknown>)[part];
            } else {
                return key;
            }
        }

        return typeof value === 'string' ? value : key;
    }
}
