任意请求都由 `handlerWrapper(req: NextRequest)` 处理，该函数是 `handler(req: NextRequest)` 之上的一个包装函数。

每个请求由 `handler()` 根据请求方法、路径进行分发，交给其他函数处理业务逻辑。

`handlerWrapper()` 自动处理 `handler()` 的执行结果，最终返回一个 `Response` 实例。它有如下策略：

- `handler()` 正常执行结束：
  - 返回了一个 `Response`，则将其返回
  - 没有返回任何内容，则返回一个 `204 No Content` 响应
  - 正常执行并返回了一些可以通过 `JSON.stringify()` 序列化的内容，则通过 `Response.ok(data)` 构造一个响应并返回

- `handler()` 执行抛出异常：
  - 捕获到 `ZodError`，通过 `fromZodError(err)` 获取错误信息，返回 `400 Bad Request` 响应
  - 捕获到 `SqlXError`，这是执行数据库操作是可能会出现的错误，返回 `500 Internal Server Error` 响应
  - 捕获到普通的 `Error`，获取 `err.message`，返回 `500 Internal Server Error` 响应


## 约定

- 任意错误，必须有条错误文本信息，并将其放在响应的 `msg` 字段中返回
- 数据库操作的异常，统一使用 `throw new SqlXError(err)` 抛出 SqlXError 类型的错误
- 请求处理函数及其直接、间接引用的函数，如果执行异常需要中断任务，都可以通过抛出 `Error` 实现，但是一定要提供错误说明信息
