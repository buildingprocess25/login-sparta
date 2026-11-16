-- Register CARBONTRACK AppModule if not exists
INSERT INTO "AppModule" ("id", "name", "shortName", "description", "callbackUrl", "colorHex", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES (
  'CARBONTRACK',
  'SPARTA Carbontrack',
  'Carbontrack',
  'Pencatatan emisi GRK Scope 1, 2, 3 dan produksi PLTS di 37 DC.',
  'https://grk.sparta-alfamart.web.id/api/auth/sso/callback',
  '#902830',
  true,
  5,
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
  "sortOrder" = 5,
  "updatedAt" = NOW();
