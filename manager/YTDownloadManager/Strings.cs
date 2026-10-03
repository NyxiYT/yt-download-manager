using System.Collections.Generic;
using System.Globalization;

namespace YTDM
{
    // UI text in English and German (the app follows the Windows display language). Short on purpose:
    // anything technical goes to the log, not on screen.
    static class S
    {
        static readonly Dictionary<string, string> En = new Dictionary<string, string>
        {
            ["AppName"] = "YT Download Manager",
            ["Close"] = "Close",
            ["TryAgain"] = "Try again",
            ["Open"] = "Open",
            ["Change"] = "Change…",
            ["Allow"] = "Allow",
            ["Deny"] = "Don't allow",

            ["SetWindow"] = "YT Download Manager Setup",
            ["SetInstall"] = "Install",
            ["SetUpdate"] = "Update",
            ["SetInstalling"] = "Installing…",
            ["SetReady"] = "Ready.",
            ["SetFailed"] = "Couldn't install.",
            ["SetDetails"] = "Details",
            ["SetUpToDate"] = "Version {0} is installed and up to date.",
            ["SetCanUpdate"] = "Version {0} is installed. Update to {1}?",
            ["SetNewerInstalled"] = "A newer version ({0}) is installed.",
            ["SetRepair"] = "Repair",
            ["SetInstallVersion"] = "Install {0}",
            ["SetUninstall"] = "Uninstall",
            ["SetUpdating"] = "Updating…",
            ["SetRepairing"] = "Repairing…",
            ["SetUpdated"] = "Updated.",
            ["SetRepaired"] = "Repaired.",
            ["SetRemoveAsk"] = "Remove YT Download Manager? Your downloaded files stay where they are.",
            ["SetRemoving"] = "Removing…",
            ["SetRemoved"] = "Removed. Also remove the extension from your browser.",
            ["Cancel"] = "Cancel",

            ["HomeReady"] = "Ready",
            ["HomeActive"] = "Downloading · {0}",
            ["HomePreparing"] = "Getting ready…",
            ["HomePrepareFailed"] = "Couldn't get ready. Check your internet connection.",
            ["HomeSaving"] = "Saving to",
            ["HomeBrowser"] = "Browser",
            ["HomeConnected"] = "Connected",
            ["HomeNotConnected"] = "Not connected",
            ["HomeAdd"] = "Add to browser",
            ["HomeAddHint"] = "Turn on Developer mode, click Load unpacked, and paste. The folder path is copied.",
            ["HomeStartup"] = "Start with Windows",
            ["HomeLog"] = "Diagnostics",

            ["TrayActive"] = "YT Download Manager · downloading {0}",
            ["MnOpen"] = "Open",
            ["MnOpenFolder"] = "Open download folder",
            ["MnChangeFolder"] = "Change download folder…",
            ["MnExit"] = "Exit",
            ["ExitAsk"] = "Downloads are still running. They continue next time. Exit now?",
            ["ApiFail"] = "YT Download Manager couldn't start. Restart your PC and try again.",

            ["PairTitle"] = "Connect browser",
            ["PairAsk"] = "Let {0} save downloads through YT Download Manager?",
            ["PickFolder"] = "Choose a download folder",
            ["FolderMissing"] = "This folder isn't available.",
            ["FolderReadonly"] = "Files can't be saved here.",
            ["FolderBad"] = "This folder can't be used. Choose another one.",
            ["FolderGoneTitle"] = "Download folder not available",
            ["FolderGoneText"] = "{0} isn't available. Downloads wait until it's back.",

            ["UpdAvail"] = "Version {0} is available.",
            ["UpdNow"] = "Update",
            ["UpdMenu"] = "Update to version {0}",
            ["UpdLoading"] = "Downloading version {0}…",
            ["UpdFailed"] = "The update couldn't be downloaded.",
            ["UpdTitle"] = "Update available",
            ["UpdText"] = "Version {0} of YT Download Manager is ready. Click here to update.",
            ["UpdDoneTitle"] = "Updated",
            ["UpdDoneText"] = "YT Download Manager is now on version {0}.",

            ["UnAsk"] = "Remove YT Download Manager?\n\nYour downloaded files stay where they are.",
            ["UnDone"] = "YT Download Manager was removed.",
        };

        static readonly Dictionary<string, string> De = new Dictionary<string, string>
        {
            ["Close"] = "Schließen",
            ["TryAgain"] = "Erneut versuchen",
            ["Open"] = "Öffnen",
            ["Change"] = "Ändern…",
            ["Allow"] = "Zulassen",
            ["Deny"] = "Nicht zulassen",

            ["SetWindow"] = "YT Download Manager Setup",
            ["SetInstall"] = "Installieren",
            ["SetUpdate"] = "Aktualisieren",
            ["SetInstalling"] = "Wird installiert…",
            ["SetReady"] = "Bereit.",
            ["SetFailed"] = "Installation fehlgeschlagen.",
            ["SetDetails"] = "Details",
            ["SetUpToDate"] = "Version {0} ist installiert und aktuell.",
            ["SetCanUpdate"] = "Version {0} ist installiert. Auf {1} aktualisieren?",
            ["SetNewerInstalled"] = "Eine neuere Version ({0}) ist installiert.",
            ["SetRepair"] = "Reparieren",
            ["SetInstallVersion"] = "{0} installieren",
            ["SetUninstall"] = "Deinstallieren",
            ["SetUpdating"] = "Wird aktualisiert…",
            ["SetRepairing"] = "Wird repariert…",
            ["SetUpdated"] = "Aktualisiert.",
            ["SetRepaired"] = "Repariert.",
            ["SetRemoveAsk"] = "YT Download Manager entfernen? Deine heruntergeladenen Dateien bleiben erhalten.",
            ["SetRemoving"] = "Wird entfernt…",
            ["SetRemoved"] = "Entfernt. Entferne auch die Erweiterung aus deinem Browser.",
            ["Cancel"] = "Abbrechen",

            ["HomeReady"] = "Bereit",
            ["HomeActive"] = "Lädt herunter · {0}",
            ["HomePreparing"] = "Wird vorbereitet…",
            ["HomePrepareFailed"] = "Vorbereitung fehlgeschlagen. Prüfe deine Internetverbindung.",
            ["HomeSaving"] = "Speichern in",
            ["HomeBrowser"] = "Browser",
            ["HomeConnected"] = "Verbunden",
            ["HomeNotConnected"] = "Nicht verbunden",
            ["HomeAdd"] = "Zum Browser hinzufügen",
            ["HomeAddHint"] = "Entwicklermodus einschalten, „Entpackte Erweiterung laden“ klicken und einfügen. Der Ordnerpfad ist kopiert.",
            ["HomeStartup"] = "Mit Windows starten",
            ["HomeLog"] = "Diagnose",

            ["TrayActive"] = "YT Download Manager · lädt {0} herunter",
            ["MnOpen"] = "Öffnen",
            ["MnOpenFolder"] = "Download-Ordner öffnen",
            ["MnChangeFolder"] = "Download-Ordner ändern…",
            ["MnExit"] = "Beenden",
            ["ExitAsk"] = "Downloads laufen noch. Sie werden beim nächsten Mal fortgesetzt. Jetzt beenden?",
            ["ApiFail"] = "YT Download Manager konnte nicht starten. Starte den PC neu und versuche es noch einmal.",

            ["PairTitle"] = "Browser verbinden",
            ["PairAsk"] = "Darf {0} Downloads über YT Download Manager speichern?",
            ["PickFolder"] = "Download-Ordner wählen",
            ["FolderMissing"] = "Dieser Ordner ist nicht verfügbar.",
            ["FolderReadonly"] = "Hier können keine Dateien gespeichert werden.",
            ["FolderBad"] = "Dieser Ordner kann nicht verwendet werden. Wähle einen anderen.",
            ["FolderGoneTitle"] = "Download-Ordner nicht verfügbar",
            ["FolderGoneText"] = "{0} ist nicht verfügbar. Downloads warten, bis er wieder da ist.",

            ["UpdAvail"] = "Version {0} ist verfügbar.",
            ["UpdNow"] = "Aktualisieren",
            ["UpdMenu"] = "Auf Version {0} aktualisieren",
            ["UpdLoading"] = "Version {0} wird heruntergeladen…",
            ["UpdFailed"] = "Das Update konnte nicht heruntergeladen werden.",
            ["UpdTitle"] = "Update verfügbar",
            ["UpdText"] = "Version {0} von YT Download Manager ist bereit. Klicke hier zum Aktualisieren.",
            ["UpdDoneTitle"] = "Aktualisiert",
            ["UpdDoneText"] = "YT Download Manager ist jetzt auf Version {0}.",

            ["UnAsk"] = "YT Download Manager entfernen?\n\nDeine heruntergeladenen Dateien bleiben erhalten.",
            ["UnDone"] = "YT Download Manager wurde entfernt.",
        };

        static Dictionary<string, string> Current
        {
            get
            {
                var lang = Settings.Current?.Lang ?? CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
                return lang == "de" ? De : En;
            }
        }

        public static string T(string key) => Current.TryGetValue(key, out var v) ? v : En.TryGetValue(key, out var e) ? e : key;
        public static string T(string key, params object[] args) => string.Format(T(key), args);
    }
}
