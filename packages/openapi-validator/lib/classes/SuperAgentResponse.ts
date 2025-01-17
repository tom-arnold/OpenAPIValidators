import type { Response, SuperAgentRequest } from 'superagent';
import AbstractResponse from './AbstractResponse';

const isEmptyObj = (obj: unknown): obj is Record<string, never> =>
  !!obj && Object.entries(obj).length === 0 && obj.constructor === Object;

export type RawSuperAgentResponse = Response & {
  req: SuperAgentRequest & { path: string };
};

export default class SuperAgentResponse extends AbstractResponse {
  private isResTextPopulatedInsteadOfResBody: boolean;

  constructor(protected res: RawSuperAgentResponse) {
    super(res);
    this.status = res.status;
    this.body = res.body;
    this.req = res.req;
    this.isResTextPopulatedInsteadOfResBody =
      res.text !== '{}' && isEmptyObj(this.body);
    this.bodyHasNoContent = res.text === '';
  }

  getBodyForValidation(): SuperAgentResponse['body'] {
    if (this.bodyHasNoContent) {
      return null;
    }
    if (this.isResTextPopulatedInsteadOfResBody) {
      return this.res.text;
    }
    return this.body;
  }

  summary(): ReturnType<AbstractResponse['summary']> & {
    text?: string;
  } {
    return {
      ...super.summary(),
      ...(this.isResTextPopulatedInsteadOfResBody && { text: this.res.text }),
    };
  }
}
