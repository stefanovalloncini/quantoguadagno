#!/usr/bin/env bash
# Fetch self-hosted WOFF2 fonts into public/fonts/.
# Idempotent: re-running is safe; files with non-zero size are kept as-is.
#
# Archivo (Omnibus-Type, SIL OFL), one family in two widths:
#   - Archivo 400/500/600 at width 100%   body, labels, headings
#   - Archivo 600 at width 125%           wordmark and the net figure
#
# Google Fonts answers the wght@400;500;600 request with a single variable
# file per subset, so the three weights share one download. The wdth,wght
# request answers with a static Expanded 600 instance.
#
# Two unicode subsets per face: "latin" (U+0000-00FF, Italian accents
# included) and "latin-ext" (U+0100-02BA). The browser picks at render time.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/fonts"
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

mkdir -p "$DEST"
cd "$DEST"

download() {
    local url="$1"
    local out="$2"
    if [ -f "$out" ] && [ -s "$out" ] && [ "$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")" -gt 3000 ]; then
        echo "  $out (cached)"
        return 0
    fi
    if [ -z "$url" ]; then
        echo "no URL for $out" >&2
        return 1
    fi
    echo "  fetching $out"
    curl -fsSL -A "$UA" -o "$out.tmp" "$url"
    mv "$out.tmp" "$out"
}

# Extract a woff2 URL from a Google Fonts CSS block matching weight+style+latin-range.
# $1 = full CSS text
# $2 = weight (e.g. 400)
# $3 = style (normal|italic)
# $4 = range-marker — either "0000-00FF" (latin) or "0100-02BA" (latin-ext)
gf_url() {
    local css="$1"
    local weight="$2"
    local style="$3"
    local marker="$4"
    echo "$css" \
        | awk -v w="$weight" -v s="$style" -v m="$marker" '
            /@font-face/ { buf=""; in_block=1 }
            in_block { buf = buf "\n" $0 }
            /^}/ && in_block {
                if (buf ~ ("font-weight: " w ";") \
                    && buf ~ ("font-style: " s ";") \
                    && buf ~ m) {
                    if (match(buf, /url\(https:\/\/[^)]+\.woff2\)/)) {
                        u = substr(buf, RSTART + 4, RLENGTH - 5)
                        print u
                        exit
                    }
                }
                in_block=0; buf=""
            }
        '
}

# --- Archivo, variable weight at the default width ---
AR_CSS="$(curl -fsSL -A "$UA" 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&display=swap')"

download "$(gf_url "$AR_CSS" 400 normal 0000-00FF)" "Archivo-latin.woff2"
download "$(gf_url "$AR_CSS" 400 normal 0100-02BA)" "Archivo-latinExt.woff2"

# --- Archivo Expanded 600 (width 125%) ---
AX_CSS="$(curl -fsSL -A "$UA" 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,600&display=swap')"

download "$(gf_url "$AX_CSS" 600 normal 0000-00FF)" "ArchivoExpanded-600-latin.woff2"
download "$(gf_url "$AX_CSS" 600 normal 0100-02BA)" "ArchivoExpanded-600-latinExt.woff2"

AC_CSS="$(curl -fsSL -A "$UA" 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@87.5,400..600&display=swap')"

download "$(gf_url "$AC_CSS" "400 600" normal 0000-00FF)" "ArchivoSemiCondensed-latin.woff2"
download "$(gf_url "$AC_CSS" "400 600" normal 0100-02BA)" "ArchivoSemiCondensed-latinExt.woff2"

echo
echo "Done. Contents of $DEST:"
ls -lh "$DEST"
