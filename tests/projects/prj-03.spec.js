import { test, expect } from "@playwright/test";
import "dotenv/config";
import {
    TEST_USER_ID,
    MEMBER_ID as CONST_MEMBER_ID,
    PROJECT_KEY as CONST_PROJECT_KEY,
} from "../../src/utilities/constant.js";
import { schemaDoc, validateSchema } from "../../src/utilities/validation.js";

const baseURL = process.env.BASE_URL;
const projectKey = process.env.PROJECT_KEY || CONST_PROJECT_KEY;
const memberId = process.env.MEMBER_ID || CONST_MEMBER_ID;

const headers = {
    "X-User-Id": TEST_USER_ID,
};

test.describe("PRJ-03 - GET /projects/:key", () => {
    test.afterAll(async ({ request }) => {
        await request.post(`${baseURL}/api/projects/${projectKey}/members`, {
            headers,
            data: {
                userId: memberId,
                role: "Member",
            },
        });
    });

    // 1. Happy path: truyền vào key là PROJECT_KEY đọc từ env
    test("Happy path - Lấy thông tin project kèm danh sách thành viên", async ({
        request,
    }) => {
        const response = await request.get(
            `${baseURL}/api/projects/${projectKey}`,
            {
                headers,
            },
        );
        expect(response.status()).toBe(200);
        const body = await response.json();

        await validateSchema(
            { request },
            body,
            schemaDoc.components.schemas.ProjectDetail,
        );

    });
    // 2. Negative path: not a member, gọi API xóa member khỏi projectKey rồi test API GET trả về 404
    test("Negative path - User không phải member trả về 404 sau khi xóa khỏi project", async ({
        request,
    }) => {
        const deleteResponse = await request.delete(
            `${baseURL}/api/projects/${projectKey}/members/${memberId}`,
            {
                headers,
            },
        );
        expect([204, 404]).toContain(deleteResponse.status());

        const memberHeaders = {
            "X-User-Id": memberId,
        };
        const getResponse = await request.get(
            `${baseURL}/api/projects/${projectKey}`,
            {
                headers: memberHeaders,
            },
        );
        expect(getResponse.status()).toBe(404);
        const body = await getResponse.json();
        await validateSchema({ request }, body, schemaDoc.components.schemas.Error);
    });

    // 3. Negative path: truyền vào projectKey là HTTT trả về 404
    test("Negative path - Truyền vào projectKey là HTTT trả về 404", async ({
        request,
    }) => {
        const response = await request.get(
            `${baseURL}/api/projects/HTTT`,
            {
                headers,
            },
        );
        expect(response.status()).toBe(404);
        const body = await response.json();
        await validateSchema({ request }, body, schemaDoc.components.schemas.Error);

    });

    // 4. Negative path: không truyền header trả về 401
    test("Negative path - return 401 when X-User-Id header is missing", async ({
        request,
    }) => {
        const response = await request.get(
            `${baseURL}/api/projects/${projectKey}`,
        );
        expect(response.status()).toBe(401);
    });
});
