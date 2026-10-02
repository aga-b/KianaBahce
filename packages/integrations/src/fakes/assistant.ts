import type {
  AssistantProvider,
  AssistantRequest,
  AssistantResult,
} from "../ports/assistant.ts";

export class FakeAssistantProvider implements AssistantProvider {
  readonly requests: AssistantRequest[] = [];
  private nextResults: AssistantResult[] = [];

  scriptNext(result: AssistantResult): void {
    this.nextResults.push(result);
  }

  async generate(request: AssistantRequest): Promise<AssistantResult> {
    this.requests.push(request);
    const scripted = this.nextResults.shift();
    if (scripted) return scripted;
    return {
      kind: "ok",
      text: "Bu sahte asistan yanıtıdır; gerçek bilgi içermez.",
    };
  }
}
