import { faker } from "@faker-js/faker";
import { type Usage } from "./schema";

faker.seed(424242);

const statuses: Usage["status"][] = ["success", "failed", "pending"];
const browsers = ["chrome", "firefox", "webkit"] as const;
const formats = ["png", "jpeg", "pdf", "webp"] as const;

function getMonth(date: Date) {
  return date.toISOString().slice(0, 7);
}

export const usageLogs: Usage[] = Array.from({ length: 120 }, () => {
  const createdAt = faker.date.recent({ days: 45 });
  const status = faker.helpers.arrayElement(statuses);
  const callbackConfigured = faker.datatype.boolean(0.55);
  const hasDownload = status === "success" && faker.datatype.boolean(0.85);
  const webhookSent = callbackConfigured && status !== "pending" && faker.datatype.boolean(0.8);

  return {
    id: faker.string.uuid(),
    userId: `user_${faker.number.int({ min: 1, max: 3 })}`,
    apiKeyId: faker.string.uuid(),
    apiKeyName: `Key ${faker.number.int({ min: 1, max: 8 })}`,
    url: faker.internet.url(),
    browser: faker.helpers.arrayElement(browsers),
    format: faker.helpers.arrayElement(formats),
    status,
    durationMs: faker.number.int({ min: 120, max: 5600 }),
    month: getMonth(createdAt),
    storageKey: hasDownload ? `screenshots/${faker.string.alphanumeric(24)}` : null,
    downloadUrl: hasDownload ? faker.internet.url() : null,
    callbackUrl: callbackConfigured ? faker.internet.url() : null,
    webhookSentAt: webhookSent ? faker.date.between({ from: createdAt, to: new Date() }) : null,
    expiresAt: faker.datatype.boolean(0.35) ? faker.date.soon({ days: 20, refDate: createdAt }) : null,
    createdAt,
  };
});
