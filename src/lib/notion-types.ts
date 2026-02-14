export interface NotionItem {
    id: string;
}

export interface MatchingItem extends NotionItem {
    id: string;
    name: string;
    email: string;
    practitionerStatus: string;
    website: string;
    domain: string; // rich_text in Notion, kept as string
    surveyFeedback: string;
    whatToConserve: string;
    effectiveCollaboration: string;
    timeCommitment: string; // select
    userType: string; // select
    submissionDate: string; // date string
    committedTo: string;
    keywords: string[]; // multi_select
    about: string;
    organization: string; // select
    whyImportant: string;
    verificationCode?: string;
    codeExpiresAt?: string;
    resendCount?: number;
}

export interface ProjectItem extends NotionItem {
    id: string;
    name: string;
    type: string; // rich_text
    description: string;
    coverImage: string; // URL
    status: string; // status name
    slug: string;
}

export interface PeopleItem extends NotionItem {
    id: string;
    name: string;
    bio: string;
    website: string;
    email: string;
    role: string;
    headshot: string; // URL
}

export interface NewsItem extends NotionItem {
    id: string;
    title: string;
    date: string;
    type: string; // select
    summary: string;
}
