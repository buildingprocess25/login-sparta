import crypto from "node:crypto"

import type { NextFunction, Request, Response } from "express"

const REQUEST_ID_HEADER = "x-request-id"

export function requestContext(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const requestId =
    request.header(REQUEST_ID_HEADER) ?? crypto.randomUUID().replaceAll("-", "")

  response.setHeader(REQUEST_ID_HEADER, requestId)
  next()
}
