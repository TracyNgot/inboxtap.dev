export interface CapturedEmail {
  id: string;
  receivedAt: string;
  envelope: EmailEnvelope;
  from: string;
  to: string[];
  subject: string;
  headers: Record<string, string>;
  text: string;
  html: string;
  links: string[];
  codes: string[];
  raw: string;
}

export interface EmailEnvelope {
  from: string | null;
  to: string[];
}

export interface EmailFilters {
  to?: string;
  subject?: string;
  afterId?: string;
  limit?: number;
}

export interface EmailSearch extends EmailFilters {
  subjectRegex?: RegExp;
}

export interface HealthResponse {
  ok: true;
  api: HostPort;
  smtp: HostPort;
  domain: string;
}

export interface HostPort {
  host: string;
  port: number;
}

export interface InboxTapServerOptions {
  smtpHost?: string;
  smtpPort?: number;
  apiHost?: string;
  apiPort?: number;
  domain?: string;
  maxMessages?: number;
  maxMessageSize?: number;
}
