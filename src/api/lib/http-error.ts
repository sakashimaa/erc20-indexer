export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string = 'error',
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message, 'not_found');
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message, 'bad_request');
  }
}
