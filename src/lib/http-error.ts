import { StatusCode } from './http'

type ExceptionMessage = string | object

type HttpErrorOptions = {
  headers?: ResponseInit['headers']
}

export class HttpError extends Error {
  constructor(
    private readonly body: string | object,
    private readonly status: StatusCode,
    private readonly options?: HttpErrorOptions
  ) {
    super()
  }

  get response() {
    const resInit: ResponseInit = {
      status: this.status,
      headers: this.options?.headers,
    }
    if (typeof this.body === 'string') {
      return new Response(this.body, resInit)
    }
    return Response.json(this.body, resInit)
  }
}

export class BadRequestError extends HttpError {
  constructor(msg?: ExceptionMessage, opts?: HttpErrorOptions) {
    super(msg || 'Bad Request', StatusCode.BAD_REQUEST, opts)
  }
}

export class UnauthorizedError extends HttpError {
  constructor(msg?: ExceptionMessage, opts?: HttpErrorOptions) {
    super(msg || 'Unauthorized', StatusCode.UNAUTHORIZED, opts)
  }
}

export class ForbiddenError extends HttpError {
  constructor(msg?: ExceptionMessage, opts?: HttpErrorOptions) {
    super(msg || 'Forbidden', StatusCode.FORBIDDEN, opts)
  }
}

export class NotFoundError extends HttpError {
  constructor(msg?: ExceptionMessage, opts?: HttpErrorOptions) {
    super(msg || 'Not Found', StatusCode.NOT_FOUND, opts)
  }
}

export class internalServerError extends HttpError {
  constructor(msg?: ExceptionMessage, opts?: HttpErrorOptions) {
    super(msg || 'Internal Server Error', StatusCode.INTERNAL_SERVER_ERROR, opts)
  }
}
