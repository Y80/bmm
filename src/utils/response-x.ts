import { StatusCode } from '@/lib/http'
import { mergeResponseInit } from '.'

type SerializableBase = number | null | undefined | boolean | string
// type SerializableBase = null | undefined | string

export type Serializable = SerializableBase | SerializableObject | Array<Serializable>

interface SerializableObject {
  [key: string]: Serializable
}

type XBodyInit = BodyInit | Serializable

function isBodyInitType(body: any) {
  let ctr = body.constructor
  return [String, ReadableStream, Blob, FormData, URLSearchParams, ArrayBuffer].includes(ctr)
}

export default class ResponseX extends Response {
  constructor(body?: XBodyInit, init?: ResponseInit) {
    if (!body || isBodyInitType(body)) {
      // @ts-ignore
      super(body, init)
      return
    }
    super(
      JSON.stringify(body),
      mergeResponseInit(init, { headers: { 'Content-Type': 'application/json' } })
    )
  }

  static ok(body?: XBodyInit, init?: ResponseInit) {
    return new ResponseX(body || 'OK', mergeResponseInit(init, { status: StatusCode.OK }))
  }

  static created(body?: XBodyInit, init?: ResponseInit) {
    return new ResponseX(body || 'Created', mergeResponseInit(init, { status: StatusCode.CREATED }))
  }

  static noContent(init?: ResponseInit) {
    return new ResponseX(null, mergeResponseInit(init, { status: StatusCode.NO_CONTENT }))
  }

  static badRequest(body?: Serializable, init?: ResponseInit) {
    return new ResponseX(
      body || 'Bad request',
      mergeResponseInit(init, { status: StatusCode.BAD_REQUEST })
    )
  }

  static unauthorized(body?: Serializable, init?: ResponseInit) {
    return new ResponseX(
      body || 'Unauthorized',
      mergeResponseInit(init, { status: StatusCode.UNAUTHORIZED })
    )
  }

  static forbidden(body?: Serializable, init?: ResponseInit) {
    return new ResponseX(
      body || 'Forbidden',
      mergeResponseInit(init, { status: StatusCode.FORBIDDEN })
    )
  }

  static notFound(body?: Serializable, init?: ResponseInit) {
    return new ResponseX(
      body || 'Not found',
      mergeResponseInit(init, { status: StatusCode.NOT_FOUND })
    )
  }

  static internalServerError(body?: Serializable, init?: ResponseInit) {
    return new ResponseX(
      body || 'Internal server error',
      mergeResponseInit(init, { status: StatusCode.INTERNAL_SERVER_ERROR })
    )
  }

  static notImplemented(body?: Serializable, init?: ResponseInit) {
    return new ResponseX(
      body || 'Not implemented',
      mergeResponseInit(init, { status: StatusCode.NOT_IMPLEMENTED })
    )
  }
}
