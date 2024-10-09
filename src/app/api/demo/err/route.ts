import { HttpError } from '@/lib/http-error'
import ResponseX from '@/utils/response-x'
import { NextRequest } from 'next/server'

async function handler(req: Request) {
  return ResponseX.badRequest({ msg: { a: 1, arr: [{ num: 2 }] } })
}

async function handlerWrapper(req: NextRequest) {
  try {
    return await handler(req)
  } catch (error) {
    if (error instanceof HttpError) {
      console.log(error)
      return error.response
    }
    return Response.error()
  }
}

export { handlerWrapper as GET }
