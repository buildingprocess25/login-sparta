-- Register SIAGA AppModule if not exists
INSERT INTO "AppModule" ("id", "name", "shortName", "description", "callbackUrl", "colorHex", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES (
  'SIAGA',
  'SPARTA SIAGA',
  'SIAGA',
  'Sistem Pemantauan Cabang & Mitigasi Bencana Alfamart',
  'https://siaga.sparta-alfamart.web.id/auth/sso/callback',
  '#123B6D',
  true,
  4,
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "shortName" = EXCLUDED."shortName",
  "description" = EXCLUDED."description",
  "callbackUrl" = EXCLUDED."callbackUrl",
  "colorHex" = EXCLUDED."colorHex",
  "isActive" = true,
  "sortOrder" = 4,
  "updatedAt" = NOW();

