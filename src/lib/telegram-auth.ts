import crypto from "node:crypto";

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface ValidatedInitData {
  user?: TelegramUser;
  authDate: number;
  queryId?: string;
  raw: Record<string, string>;
}

/**
 * Validate Telegram Mini App `initData` per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * data_check_string = sorted `key=value` lines from initData (excluding hash), joined by \n
 * secret_key = HMAC_SHA256(botToken, "WebAppData")
 * valid = hex(HMAC_SHA256(data_check_string, secret_key)) === hash
 */
export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 60 * 60 * 24,
): ValidatedInitData | null {
  if (!initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  const pairs: Record<string, string> = {};
  for (const [k, v] of params.entries()) pairs[k] = v;

  const dataCheckString = Object.keys(pairs)
    .sort()
    .map((k) => `${k}=${pairs[k]}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"))) {
    return null;
  }

  const authDateStr = pairs["auth_date"];
  const authDate = authDateStr ? Number(authDateStr) : 0;
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) {
    return null;
  }

  let user: TelegramUser | undefined;
  if (pairs["user"]) {
    try {
      user = JSON.parse(pairs["user"]) as TelegramUser;
    } catch {
      user = undefined;
    }
  }

  return { user, authDate, queryId: pairs["query_id"], raw: pairs };
}
