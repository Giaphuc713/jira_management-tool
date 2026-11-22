import { test, expect } from "@playwright/test";
import "dotenv/config";
import { TEST_USER_ID, USER_UNACTIVE_ID } from "../../src/utilities/constant.js";

const baseURL = process.env.BASE_URL;

test.describe("GET /users - Authentication with X-User-Id", () => {
  // Happy path truyền TEST_USER_ID và trả về kết quả 200
  test("Happy path - should return 200 when TEST_USER_ID is provided", async ({
    request,
  }) => {
    const response = await request.get(`${baseURL}/api/users`, {
      headers: {
        "X-User-Id": TEST_USER_ID,
      },
    });
    expect(response.status()).toBe(200);
  });

  // Negative không truyền header trả về 401
  test("Negative - should return 401 when X-User-Id header is missing", async ({
    request,
  }) => {
    const response = await request.get(`${baseURL}/api/users`);
    expect(response.status()).toBe(401);
  });

  // Negative truyền USER_UNACTIVE_ID trả về 401
  test("Negative - should return 401 when USER_UNACTIVE_ID is provided", async ({
    request,
  }) => {
    const response = await request.get(`${baseURL}/api/users`, {
      headers: {
        "X-User-Id": USER_UNACTIVE_ID,
      },
    });
    expect(response.status()).toBe(401);
  });
});

