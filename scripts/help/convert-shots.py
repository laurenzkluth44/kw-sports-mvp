# Usage: python3 scripts/help/convert-shots.py <folder with visual-preview PNGs> public/help
# Crops the CI preview PNGs to the top of the screen and saves compressed JPGs for the help page.
import sys, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
MAP = {
  "login": ("auth-set-password", 1100), "cockpit": ("club-cockpit-desktop", 1100), "squad": ("squad-attack-desktop", 1100),
  "import": ("squad-import-preview-desktop", 1100), "need-form": ("need-form-desktop", 1100), "need": ("club-need-desktop", 1100),
  "suggestions": ("club-suggestions-desktop", 1100), "filled": ("club-need-filled-choice", 1100), "agency": ("needs-agency-desktop", 1100),
  "admin-needs": ("needs-admin-desktop", 1100), "players": ("kw-players-desktop", 1100), "bulk-upload": ("bulk-upload-desktop", 1100),
  "matches": ("kw-matches-desktop", 1100), "inbox": ("admin-inbox-desktop", 1100), "go-live": ("go-live-desktop", 1100),
}
for out, (name, maxh) in MAP.items():
    p = os.path.join(src, name + ".png")
    if not os.path.exists(p): print("missing", name); continue
    im = Image.open(p).convert("RGB")
    im = im.crop((0, 0, im.width, min(im.height, maxh)))
    im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    o = os.path.join(dst, out + ".jpg"); im.save(o, "JPEG", quality=74, optimize=True, progressive=True)
    print(f'  {out}: {im.width}x{im.height} {os.path.getsize(o)//1024} KB')
