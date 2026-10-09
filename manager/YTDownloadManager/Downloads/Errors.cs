using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace YTDM
{
    enum Cls { Transient, RateLimited, Expired, Broken, Permanent, Unknown }

    // A failure the user gets told about. Key is a message id the browser script translates;
    // Errors.Text has the English wording for everything else (logs, the manager's own windows).
    sealed class Fail : Exception
    {
        public readonly string Key;
        public readonly Dictionary<string, object> Vars;

        public Fail(string key, Dictionary<string, object> vars = null) : base(key)
        {
            Key = key;
            Vars = vars;
        }
    }

    // What yt-dlp noticed while asking YouTube for a video (it runs with -v for this): which apps it
    // asked and what each answered, streams it had to skip and why. Only these notes reach the log,
    // cleaned of links; the rest of the output (including the command line) never does.
    sealed class Diag
    {
        public readonly List<string> Notes = new List<string>();
        public bool Drm, Sabr, NeedsToken, AgeVerify, SignInRotated;

        static readonly Regex Interesting = new Regex(
            "player API JSON|playability status|age-restricted|age-verification|have been skipped|require a GVS PO Token|SABR|DRM|" +
            "Skipping (client|player|unsupported)|no longer valid|Premium subscription|said:|invalid",
            RegexOptions.IgnoreCase);

        public static Diag Read(string stderr)
        {
            var d = new Diag();
            foreach (var raw in (stderr ?? "").Split('\n'))
            {
                var l = raw.Trim();
                if (l.Length == 0 || l.StartsWith("ERROR:", StringComparison.Ordinal)) continue;
                if (l.IndexOf("Command-line", StringComparison.OrdinalIgnoreCase) >= 0 || l.IndexOf("--cookies", StringComparison.Ordinal) >= 0) continue;
                if (!Interesting.IsMatch(l)) continue;
                if (l.IndexOf("DRM protected", StringComparison.OrdinalIgnoreCase) >= 0) d.Drm = true;
                if (l.IndexOf("SABR", StringComparison.Ordinal) >= 0) d.Sabr = true;
                if (l.IndexOf("require a GVS PO Token", StringComparison.Ordinal) >= 0) d.NeedsToken = true;
                if (l.IndexOf("requiring account age-verification", StringComparison.Ordinal) >= 0) d.AgeVerify = true;
                if (l.IndexOf("cookies are no longer valid", StringComparison.Ordinal) >= 0) d.SignInRotated = true;
                var c = Clean(l);
                if (c.Length > 0 && !d.Notes.Contains(c) && d.Notes.Count < 16) d.Notes.Add(c);
            }
            return d;
        }

        // Without yt-dlp's debug lines and tracebacks, for sorting errors as before.
        public static string Plain(string stderr) => string.Join("\n", (stderr ?? "").Split('\n')
            .Where(l => !l.StartsWith("[debug]", StringComparison.Ordinal) && !l.StartsWith(" ", StringComparison.Ordinal) && !l.StartsWith("Traceback", StringComparison.Ordinal)));

        // No links, no advice meant for yt-dlp users, no video ID (the log line has it).
        public static string Clean(string l)
        {
            l = Regex.Replace(l, @"^\[debug\]\s*", "");
            l = Regex.Replace(l, @"\[youtube\]\s*(\[[a-z]+\]\s*)?", "");
            l = Regex.Replace(l, @"^(WARNING:\s*)?\[?[A-Za-z0-9_-]{11}\]?:\s*", "$1");
            foreach (var cut in new[] { " Use --cookies", " See  http", " See http", " For more information", " You can manually pass", " For tips on", " They will be skipped" })
            {
                int k = l.IndexOf(cut, StringComparison.Ordinal);
                if (k > 0) l = l.Substring(0, k);
            }
            l = Regex.Replace(l, @"https?://\S+", "<link>").Trim();
            return l.Length > 220 ? l.Substring(0, 220) + "..." : l;
        }
    }

    static class Errors
    {
        // Messages after which retrying the same download can't help.
        public static readonly HashSet<string> Final = new HashSet<string>
        {
            "errUnavailable", "errPrivate", "errMembers", "errAge", "errGeo", "errLive", "errFormatGone", "errReason",
            "errAgeAccount", "errMembersAccount", "errPrivateAccount", "errNoDownload", "errDrm",
        };

        static bool Has(string s, string pattern) => Regex.IsMatch(s, pattern, RegexOptions.IgnoreCase);

        public static string LastError(string stderr)
        {
            var lines = (stderr ?? "").Split('\n').Select(l => l.Trim()).Where(l => l.Length > 0).ToList();
            var err = lines.LastOrDefault(l => l.StartsWith("ERROR:", StringComparison.Ordinal));
            return (err ?? lines.LastOrDefault() ?? "").Trim();
        }

        // Sorts yt-dlp's error output into what to do next.
        public static (Cls cls, string key, Dictionary<string, object> vars) Classify(string stderr)
        {
            var e = LastError(stderr);
            var all = stderr ?? "";
            if (Has(e, "not a bot")) return (Cls.Permanent, "errBlocked", null);
            if (Has(e, "HTTP Error 403|403: Forbidden")) return (Cls.Expired, null, null);
            if (Has(e, "HTTP Error 429|Too Many Requests")) return (Cls.RateLimited, null, null);
            if (Has(e, "HTTP Error 5[0-9][0-9]")) return (Cls.Transient, null, null);
            if (Has(e, "No space left|Errno 28|not enough space|disk is full")) return (Cls.Permanent, "errDiskFull", null);
            if (Has(e, "confirm your age|age.restricted|inappropriate for some users")) return (Cls.Permanent, "errAge", null);
            if (Has(e, "Private video|video is private")) return (Cls.Permanent, "errPrivate", null);
            if (Has(e, "members.only|Join this channel|channel's members|available to members")) return (Cls.Permanent, "errMembers", null);
            if (Has(e, "not available in your country|geo.?restrict|blocked it in your country|not made this video available in your country")) return (Cls.Permanent, "errGeo", null);
            if (Has(e, "Premieres in|live event will begin|is upcoming|This live event|Waiting for the stream")) return (Cls.Permanent, "errLive", null);
            if (Has(e, "DRM protected")) return (Cls.Permanent, "errDrm", null);
            if (Has(e, "Requested format is not available")) return (Cls.Permanent, "errFormatGone", null);
            if (Has(e, "Video unavailable|video is unavailable|has been removed|account associated with this video has been terminated|no longer available|This video is not available|Incomplete YouTube ID")) return (Cls.Permanent, "errUnavailable", null);
            if (Has(e, "getaddrinfo failed|Failed to resolve|Name or service not known|No address associated|nodename nor servname|Temporary failure in name resolution"))
                return (Cls.Transient, null, null);
            if (Has(e, "timed out|Connection reset|Connection aborted|Remote end closed|RemoteDisconnected|IncompleteRead|ConnectionResetError|Unable to connect|Connection refused|EOF occurred|SSL|urlopen error|WinError 10054|WinError 10060|WinError 10053|Got error|did not get any data|Read timed out|ProtocolError|IncompleteRead|The read operation timed out|content too short|bytes read"))
                return (Cls.Transient, null, null);
            if (Has(e, "Unable to extract|Signature extraction failed|nsig extraction failed|n challenge|Failed to extract any player response|Precondition check failed|Unable to decode|jsinterp|player .*? not found|KeyError|TypeError|AttributeError|IndexError"))
                return (Cls.Broken, null, null);
            if (Has(all, "HTTP Error 403")) return (Cls.Expired, null, null);
            // "ERROR: [youtube] ID: <YouTube's own explanation>" for anything else YouTube refuses.
            var m = Regex.Match(e, "^ERROR: \\[youtube\\] [A-Za-z0-9_-]{11}: (.+)$");
            if (m.Success) return (Cls.Permanent, "errReason", new Dictionary<string, object> { ["reason"] = m.Groups[1].Value.Trim() });
            return (Cls.Unknown, null, null);
        }

        public static string Text(string key, Dictionary<string, object> vars = null)
        {
            switch (key)
            {
                case "errNetwork": return "The connection kept dropping. Your progress is kept; press Retry when your connection is stable.";
                case "errBlocked": return "YouTube is blocking downloads of this video on your current connection. If you use a VPN, turn it off or switch servers, then press Retry. Your progress is kept.";
                case "errUnavailable": return "This video isn't available.";
                case "errPrivate": return "This video is private.";
                case "errMembers": return "This video is only for channel members.";
                case "errSignIn": return "Sign in to YouTube in your browser to download this video.";
                case "errAgeAccount": return "YouTube doesn't let your account watch this video (age check).";
                case "errMembersAccount": return "This video is for members of the channel. Your account isn't a member.";
                case "errPrivateAccount": return "This video is private, and your account doesn't have access to it.";
                case "errAge": return "This video is age-restricted and can't be downloaded without signing in.";
                case "errGeo": return "This video isn't available in your country.";
                case "errLive": return "Live streams and premieres can be downloaded once they have ended.";
                case "errFormatGone": return "This format is no longer available.";
                case "errNoDownload": return "YouTube doesn't offer this video for download.";
                case "errDrm": return "This video is copy-protected, so it can't be downloaded.";
                case "errSessionExpired": return "Your YouTube sign-in has changed. Reload the YouTube page, then try again.";
                case "errDiskFull": return "There isn't enough free space. Free up some space, then press Retry.";
                case "errEngine": return "The download engine needs an update that couldn't be installed. Check your internet connection, then press Retry.";
                case "errEngineMissing": return "The Download Manager isn't ready yet. Open it from the Start menu, then press Retry.";
                case "errConvert": return "The file couldn't be converted.";
                case "errVerify": return "The downloaded file was damaged, so it wasn't saved. Press Retry to download it again.";
                case "errNoThumb": return "No thumbnail is available for this video.";
                case "errNoSubs": return "These subtitles aren't available anymore.";
                case "errReason": return vars?.Get("reason") as string ?? "YouTube refused this download.";
                default: return "Something went wrong. Please try again.";
            }
        }
    }
}
