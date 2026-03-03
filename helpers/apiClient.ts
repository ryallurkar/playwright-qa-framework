import { APIRequestContext, APIResponse, expect } from '@playwright/test';

type RequestOptions = {
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
};

export class APIClient {
  private readonly context: APIRequestContext;
  private readonly baseUrl: string;
  private authToken?: string;

  constructor(context: APIRequestContext) {
    this.context = context;
    this.baseUrl = process.env.API_BASE_URL ?? '';
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = undefined;
  }

  async get(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.context.get(this.buildUrl(path), this.createOptions(options));
  }

  async post(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.context.post(this.buildUrl(path), this.createOptions(options));
  }

  async put(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.context.put(this.buildUrl(path), this.createOptions(options));
  }

  async delete(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.context.delete(this.buildUrl(path), this.createOptions(options));
  }

  async patch(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.context.patch(this.buildUrl(path), this.createOptions(options));
  }

  async expectStatus(response: APIResponse, expectedStatus: number): Promise<void> {
    expect(response.status()).toBe(expectedStatus);
  }

  async expectBodyContains(
    response: APIResponse,
    expectedContent: Record<string, unknown> | string,
  ): Promise<void> {
    const responseBody = await this.safeParseBody(response);

    if (typeof expectedContent === 'string') {
      expect(JSON.stringify(responseBody)).toContain(expectedContent);
      return;
    }

    expect(responseBody).toMatchObject(expectedContent);
  }

  private buildUrl(path: string): string {
    if (/^https?:\/\//.test(path) || !this.baseUrl) {
      return path;
    }

    return `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  private createOptions(options: RequestOptions): RequestOptions {
    const headers = {
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return {
      ...options,
      headers,
    };
  }

  private async safeParseBody(response: APIResponse): Promise<Record<string, unknown> | string> {
    const contentType = response.headers()['content-type'] ?? '';

    if (contentType.includes('application/json')) {
      return (await response.json()) as Record<string, unknown>;
    }

    return response.text();
  }
}
