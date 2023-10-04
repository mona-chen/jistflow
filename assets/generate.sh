#!/bin/bash
# Dependencies: imagick/convert, inkscape
# Be sure to check out the submodule before running this
crop=branding/prepared/svg-crop
svg=branding/prepared/svg
png=branding/prepared/png
cd "${0%/*}"

# General assets
convert -background "#3B364C" -resize 1600x "$svg/full-light.svg" "logo.png"

# Client assets
cp "$crop/wordmark-white.svg" "../packages/client/assets/welcome-logo.svg"
convert -background "#E7EDFF" -resize 1024x "$svg/full-dark.svg" "../packages/client/assets/about-icon-dark.png"
convert -background "#3B364C" -resize 1024x "$svg/full-light.svg" "../packages/client/assets/about-icon-light.png"

# Backend assets
convert -background "#E7EDFF" -resize 1024x "$svg/full-dark.svg" "../packages/backend/assets/api-doc.png"
convert -background "#E7EDFF" -resize 1024x "$svg/wordmark-dark.svg" "../packages/backend/assets/mail-wordmark.png"
convert -background "#3B364C" -resize x750 -gravity center -extent 1024x1024 "$crop/logo-light.svg" "../packages/backend/assets/apple-touch-icon.png"
convert -background "#3B364C" -resize x192 -gravity center -extent 192x192   "$svg/logo-light.svg"   "../packages/backend/assets/icons/192.png"
convert -background "#3B364C" -resize x512 -gravity center -extent 512x512   "$svg/logo-light.svg"   "../packages/backend/assets/icons/512.png"
convert -background "#3B364C" -resize x480 -gravity center -extent 512x512   "$svg/logo-light.svg"   "../packages/backend/assets/icons/maskable.png"
convert -background none      -resize x512 -gravity center -extent 512x512   "$crop/logo-black.svg" "../packages/backend/assets/icons/monochrome.png"
convert \( -background "#3B364C" -resize x750 -gravity center -extent 1024x1024  "$crop/logo-light.svg" \) \( -size 1024x1024 xc:black -fill white -draw "roundRectangle 0,0,1024,1024 128,128" \) -alpha Off -compose CopyOpacity -composite "../packages/backend/assets/splash.png"
convert \( -background "#3B364C" -resize x200 -gravity center -extent 256x256    "$crop/logo-light.svg" \) \( -size 256x256 xc:black   -fill white -draw "roundRectangle 0,0,256,256 32,32" \)   -alpha Off -compose CopyOpacity -composite "../packages/backend/assets/favicon.png"
convert \( -background "#3B364C" -resize x200 -gravity center -extent 256x256    "$crop/logo-light.svg" \) \( -size 256x256 xc:black   -fill white -draw "roundRectangle 0,0,256,256 32,32" \)   -alpha Off -compose CopyOpacity -composite "../packages/backend/assets/favicon.ico"
