# Test fixtures

## `info/`: what `yt-dlp -J` answers

| File | Where it comes from |
|---|---|
| `big-buck-bunny.json` | `yt-dlp -J https://www.youtube.com/watch?v=aqz-KE-bpKQ` (landscape, up to 4K60, AVC/VP9/AV1, DRC audio) |
| `short-portrait.json` | `yt-dlp -J https://www.youtube.com/shorts/gXWsa1IP71A` (a Blender Studio Short: portrait, 608×1080 streams labelled 480p) |
| `me-at-the-zoo.json` | `yt-dlp -J https://www.youtube.com/watch?v=jNQXAC9IVRw` (old and small: 240p at most, two AVC streams of the same height) |
| `hand-made-combined-only.json` | Written by hand: only finished video+sound streams (HTTPS and HLS), as the iPhone app's answer sometimes is. YouTube didn't offer one to an anonymous request when the others were saved |

The real ones were saved with yt-dlp 2026.08.19 on 2026-10-13, then trimmed to what `Media.Parse` reads.
Links keep only `expire`, `itag`, `clen`, `lmt`, `dur` and `mime`: no IP address, no signature. HLS links
are reduced to their itag. Storyboards and subtitle lists are left out.

## `stderr/`: yt-dlp's error output

One file per kind of failure that `Errors.Classify` sorts. `format-gone.txt` is real output (the same
day, iPhone app, no sign-in); the others follow yt-dlp's wording for each case, with made-up video IDs
where the real case needs a specific video.

## `update-signing/`: a signed checksum list

`SHA256SUMS.txt` signed the way the release workflow signs it (`openssl pkeyutl -sign -rawin`, then base64)
with a key made for these tests only; `test-key.pem` is its public half. The private half wasn't kept.
