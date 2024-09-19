export async function GET(req: Request) {
  return Response.json({
    message: 'Hello, world!',
    url: req.url,
    reqHeaders: [...req.headers.keys()],
  })
}
