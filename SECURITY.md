# Security Policy

## Supported versions

Only the [latest release](https://github.com/NyxiYT/yt-download-manager/releases/latest) gets security fixes.
Please update before you report a problem.

## Reporting a security problem

**Please don't report security problems in public issues or discussions.**

Report them privately instead:

1. Open the [Security tab](https://github.com/NyxiYT/yt-download-manager/security) of this repository.
2. Click **Report a vulnerability** (or go straight to the
   [private report form](https://github.com/NyxiYT/yt-download-manager/security/advisories/new)).
3. Describe the problem, how to reproduce it, and what an attacker could do with it.

Only you and the maintainer can see the report. You'll get an answer within 7 days. Once the problem is
fixed and a new release is out, the report can be published, and you'll be credited if you want.

## What counts

For example:

- Another website or program on your PC can use the app's local connection (`127.0.0.1:17724`) to start
  downloads, read files or get your YouTube sign-in.
- The extension leaks your YouTube cookies or other data to anyone except the app on your own PC.
- The installer or the app can be tricked into running or replacing files outside its own folders.
