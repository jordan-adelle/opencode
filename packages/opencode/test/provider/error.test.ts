import { test, expect } from "bun:test"
import { APICallError } from "ai"

import { parseAPICallError } from "../../src/provider/error"
import { ProviderID } from "../../src/provider/schema"

test("navy daily token limit errors are not retried", () => {
  const error = new APICallError({
    message: "Too Many Requests",
    url: "https://api.navy/v1/chat/completions",
    requestBodyValues: {},
    statusCode: 429,
    responseHeaders: {},
    responseBody: JSON.stringify({
      error: {
        code: "navy_daily_token_limit",
        message:
          "NavyAI daily token limit reached. 5264/150000 tokens remaining today. 96.5% used. Resets at 2026-04-26T00:00:00.000Z.",
      },
    }),
    isRetryable: true,
    data: undefined,
  })

  const result = parseAPICallError({ providerID: ProviderID.navy, error })

  expect(result.type).toBe("api_error")
  if (result.type !== "api_error") throw new Error("expected API error")
  expect(result.isRetryable).toBe(false)
  expect(result.message).toContain("NavyAI daily token limit reached")
  expect(result.message).toContain("5264/150000 tokens remaining today")
})
