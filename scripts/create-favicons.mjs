import sharp from "sharp";

const logoPath = "public/kw-sports-logo.png";

await createIcon(512, "src/app/icon.png");
await createIcon(180, "src/app/apple-icon.png");

async function createIcon(size, outputPath) {
  const logo = await sharp(logoPath)
    .resize({
      width: Math.round(size * 0.78),
      height: Math.round(size * 0.5),
      fit: "inside"
    })
    .png()
    .toBuffer();

  const radius = Math.round(size * 0.18);
  const inset = Math.round(size * 0.055);
  const strokeWidth = Math.max(8, Math.round(size * 0.045));
  const innerSize = size - inset * 2;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/>
      <rect x="${inset}" y="${inset}" width="${innerSize}" height="${innerSize}" rx="${Math.round(size * 0.14)}" fill="none" stroke="#0b55e8" stroke-width="${strokeWidth}"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(outputPath);
}
