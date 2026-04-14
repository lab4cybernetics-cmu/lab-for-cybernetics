/**
 * Visual tokens aligned with `MatchingRecommendationCard` (scholar / practitioner / default).
 */
export type MatchingProfileTheme = {
    cardBorder: string;
    headerBar: string;
    headerIcon: string;
    numberBadge: string;
    optionSelected: string;
    radioChecked: string;
    continueBtn: string;
    questionAccent: string;
};

export function getMatchingProfileTheme(userType?: string | null, forceNeutral = false): MatchingProfileTheme {
    if (forceNeutral) {
        return {
            cardBorder: 'border-neutral-200',
            headerBar: 'bg-neutral-50/80 border-b border-neutral-100 text-neutral-900',
            headerIcon: 'text-neutral-500',
            numberBadge: 'bg-neutral-900 text-white',
            optionSelected: 'border-neutral-900 bg-neutral-50 shadow-sm',
            radioChecked: 'border-neutral-900 bg-neutral-900',
            continueBtn: 'bg-neutral-900 hover:bg-black text-white px-4 py-2 transition-all active:scale-[0.98]',
            questionAccent: 'border-l-[1px] border-neutral-200',
        };
    }

    const t = userType?.toLowerCase() ?? '';
    const isScholar = t.includes('scholar');
    const isPractitioner = t.includes('practitioner');

    if (isScholar) {
        return {
            cardBorder: 'border-green-100 hover:border-green-300',
            headerBar: 'bg-green-50/50 border-b border-green-100 text-green-800',
            headerIcon: 'text-green-700',
            numberBadge: 'bg-green-800 text-white',
            optionSelected: 'border-green-600/90 bg-green-50/90 shadow-sm',
            radioChecked: 'border-green-600 bg-green-600',
            continueBtn: 'bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-700/20 active:scale-[0.98] transition-all',
            questionAccent: 'border-l-4 border-green-200',
        };
    }
    if (isPractitioner) {
        return {
            cardBorder: 'border-orange-100 hover:border-orange-300',
            headerBar: 'bg-orange-50/50 border-b border-orange-100 text-orange-800',
            headerIcon: 'text-orange-700',
            numberBadge: 'bg-orange-800 text-white',
            optionSelected: 'border-orange-600/90 bg-orange-50/90 shadow-sm',
            radioChecked: 'border-orange-600 bg-orange-600',
            continueBtn: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 active:scale-[0.98] transition-all',
            questionAccent: 'border-l-4 border-orange-200',
        };
    }

    return {
        cardBorder: 'border-neutral-200',
        headerBar: 'bg-neutral-50/80 border-b border-neutral-100 text-neutral-900',
        headerIcon: 'text-neutral-500',
        numberBadge: 'bg-neutral-900 text-white',
        optionSelected: 'border-neutral-900 bg-neutral-50 shadow-sm',
        radioChecked: 'border-neutral-900 bg-neutral-900',
        continueBtn: 'bg-neutral-900 hover:bg-black text-white px-4 py-2 transition-all active:scale-[0.98]',
        questionAccent: 'border-l-[1px] border-neutral-200',
    };
}
