export function getSiteUrl() {
  const vercelEnv = process.env.VERCEL_ENV?.trim();
  const deploymentUrl = process.env.VERCEL_URL?.trim();

  if (vercelEnv === "preview" && deploymentUrl) {
    return `https://${deploymentUrl}`.replace(/\/$/, "");
  }

  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicitUrl) return explicitUrl.replace(/\/$/, "");

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) return `https://${productionUrl}`.replace(/\/$/, "");

  if (deploymentUrl) return `https://${deploymentUrl}`.replace(/\/$/, "");

  return "http://localhost:3000";
}

export function getAuthConfirmUrl(next = "/set-password") {
  const params = new URLSearchParams({ next });
  return `${getSiteUrl()}/auth/confirm?${params.toString()}`;
}
