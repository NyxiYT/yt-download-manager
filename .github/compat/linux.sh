#!/usr/bin/env bash
# Installs one browser and one kind of desktop session on this Linux machine (a build server or a container
# on it), then runs ext-check.js in that browser. Results go to <out>.json.
#
# usage: linux.sh <browser> <session> <out>
#   browser: chrome | chromium | chromium-snap | edge | brave | opera | vivaldi
#            | chrome-flatpak | chromium-flatpak | brave-flatpak
#   session: x11 | wayland | gnome-wayland | gnome-x11 | kde-wayland | kde-x11
set -euo pipefail
browser=$1 session=$2 out=$(realpath -m "$3")
here=$(cd "$(dirname "$0")" && pwd)
repo=$(cd "$here/../.." && pwd)
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO=sudo
. /etc/os-release
# Linux Mint's container images keep Ubuntu's os-release; their package sources tell them apart.
if grep -qs packages.linuxmint.com /etc/apt/sources.list.d/*.list; then ID=linuxmint PRETTY_NAME="Linux Mint ($PRETTY_NAME base)"; fi
family=$ID; case " ${ID_LIKE:-} " in *" debian "*|*" ubuntu "*) family=debian ;; esac
[ "$ID" = ubuntu ] && family=debian

install() {
  case $family in
    debian) $SUDO apt-get update -qq && DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y -qq --no-install-recommends "$@" >/dev/null ;;
    fedora) $SUDO dnf install -y -q "$@" >/dev/null ;;
    arch) $SUDO pacman -Sy --noconfirm --needed "$@" >/dev/null ;;
    *) echo "unknown distribution $ID"; exit 2 ;;
  esac
}

# A vendor's package repository (Debian family).
apt_repo() { # name key-url line
  install ca-certificates curl gnupg
  curl -fsSL "$2" | $SUDO gpg --dearmor --yes -o "/usr/share/keyrings/$1.gpg"
  echo "deb [arch=amd64 signed-by=/usr/share/keyrings/$1.gpg] $3" | $SUDO tee "/etc/apt/sources.list.d/$1.list" >/dev/null
}

# Basics every session needs: fonts (pages measure text), D-Bus, a few libraries the browsers expect.
case $family in
  debian) install ca-certificates curl dbus dbus-x11 fonts-dejavu-core fonts-noto-core xauth xvfb ;;
  fedora) install ca-certificates curl dbus-daemon dbus-tools dbus-x11 dejavu-sans-fonts google-noto-sans-fonts xorg-x11-server-Xvfb xorg-x11-xauth ;;
  arch) install ca-certificates curl dbus ttf-dejavu noto-fonts xorg-server-xvfb xorg-xauth ;;
esac

# Node 18 or newer (the build server brings its own; older distributions package an older one).
if ! node -e 'process.exit(+process.versions.node.split(".")[0] >= 18 ? 0 : 1)' 2>/dev/null; then
  install xz-utils 2>/dev/null || install xz
  v=$(curl -fsSL https://nodejs.org/dist/index.json | grep -o '"version":"v22[^"]*"' | head -1 | cut -d'"' -f4)
  curl -fsSL "https://nodejs.org/dist/$v/node-$v-linux-x64.tar.xz" | $SUDO tar -xJ -C /opt
  export PATH="/opt/node-$v-linux-x64/bin:$PATH"
fi

# ---------- the browser ----------
launcher="" bin="" extra=()
[ "$(id -u)" -eq 0 ] && extra+=(--no-sandbox) # containers run as root, where Chromium needs this
flatpak_app() {
  install flatpak
  flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
  flatpak install --user -y --noninteractive flathub "$1" >/dev/null
  # The sandbox sees the extension and the profile only where it is allowed to: inside its own data folder.
  local home="$HOME/.var/app/$1/ysd"
  mkdir -p "$home"
  cp -r "$repo/extension" "$home/extension"
  ext="$home/extension" profile="$home/profile"
  launcher="flatpak run --filesystem=$home $1"
}
ext="$repo/extension" profile=$(mktemp -d)
case $browser in
  chrome)
    if ! command -v google-chrome >/dev/null; then
      case $family in
        debian) apt_repo google https://dl.google.com/linux/linux_signing_key.pub "http://dl.google.com/linux/chrome/deb/ stable main"; install google-chrome-stable ;;
        fedora) install fedora-workstation-repositories || true; $SUDO dnf config-manager setopt google-chrome.enabled=1 || true; install google-chrome-stable ;;
      esac
    fi
    bin=$(command -v google-chrome) ;;
  chromium)
    case $ID in
      ubuntu) echo "chromium on Ubuntu is a Snap: use chromium-snap"; exit 2 ;;
      debian|linuxmint) install chromium; bin=$(command -v chromium) ;;
      fedora) install chromium; bin=$(command -v chromium-browser || command -v chromium) ;;
      arch) install chromium; bin=$(command -v chromium) ;;
    esac ;;
  chromium-snap)
    $SUDO snap install chromium >/dev/null
    # A Snap sees the home folder (not its hidden folders), so the extension and profile go there.
    mkdir -p "$HOME/ysd-snap"; cp -r "$repo/extension" "$HOME/ysd-snap/extension"
    ext="$HOME/ysd-snap/extension" profile="$HOME/ysd-snap/profile" bin=/snap/bin/chromium ;;
  edge)
    apt_repo microsoft-edge https://packages.microsoft.com/keys/microsoft.asc "https://packages.microsoft.com/repos/edge stable main"
    install microsoft-edge-stable; bin=$(command -v microsoft-edge) ;;
  brave)
    install ca-certificates curl
    $SUDO curl -fsSLo /usr/share/keyrings/brave.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/brave.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main" | $SUDO tee /etc/apt/sources.list.d/brave.list >/dev/null
    install brave-browser; bin=$(command -v brave-browser) ;;
  opera)
    echo "opera-stable opera-stable/add-deb-source boolean false" | $SUDO debconf-set-selections
    apt_repo opera https://deb.opera.com/archive.key "https://deb.opera.com/opera-stable/ stable non-free"
    install opera-stable; bin=$(command -v opera) ;;
  vivaldi)
    apt_repo vivaldi https://repo.vivaldi.com/archive/linux_signing_key.pub "https://repo.vivaldi.com/archive/deb/ stable main"
    install vivaldi-stable; bin=$(command -v vivaldi) ;;
  chrome-flatpak) flatpak_app com.google.Chrome ;;
  chromium-flatpak) flatpak_app org.chromium.Chromium ;;
  brave-flatpak) flatpak_app com.brave.Browser ;;
  *) echo "unknown browser $browser"; exit 2 ;;
esac

# ---------- the session ----------
export XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR:-/tmp/xdg-$(id -u)}
mkdir -p "$XDG_RUNTIME_DIR"; chmod 700 "$XDG_RUNTIME_DIR"
unset WAYLAND_DISPLAY
start_x() { Xvfb :99 -screen 0 1440x900x24 -nolisten tcp >/dev/null 2>&1 & export DISPLAY=:99; sleep 2; }
wait_wayland() {
  for _ in $(seq 60); do [ -S "$XDG_RUNTIME_DIR/$1" ] && break; sleep 0.5; done
  [ -S "$XDG_RUNTIME_DIR/$1" ] || { echo "no Wayland display $1"; tail -30 /tmp/compositor.log; exit 3; }
  export WAYLAND_DISPLAY=$1; unset DISPLAY
}
eval "$(dbus-launch --sh-syntax)"
case $session in
  x11) start_x; export XDG_CURRENT_DESKTOP=none ;;
  wayland)
    case $family in debian) install weston ;; fedora) install weston ;; arch) install weston ;; esac
    weston --backend=headless --socket=wayland-ysd --width=1440 --height=900 >/tmp/compositor.log 2>&1 &
    wait_wayland wayland-ysd; export XDG_CURRENT_DESKTOP=none ;;
  gnome-wayland)
    case $family in debian) install mutter xwayland ;; fedora) install mutter xorg-x11-server-Xwayland ;; arch) install mutter xorg-xwayland ;; esac
    mutter --headless --wayland --wayland-display=wayland-ysd --virtual-monitor 1440x900 >/tmp/compositor.log 2>&1 &
    wait_wayland wayland-ysd; export XDG_CURRENT_DESKTOP=GNOME XDG_SESSION_TYPE=wayland ;;
  gnome-x11)
    install mutter; start_x
    mutter --x11 --replace --sm-disable >/tmp/compositor.log 2>&1 &
    sleep 3; export XDG_CURRENT_DESKTOP=GNOME XDG_SESSION_TYPE=x11 ;;
  kde-wayland)
    case $family in debian) install kwin-wayland ;; fedora) install kwin-wayland ;; arch) install kwin ;; esac
    kwin_wayland --virtual --width 1440 --height 900 --socket wayland-ysd --no-lockscreen >/tmp/compositor.log 2>&1 &
    wait_wayland wayland-ysd; export XDG_CURRENT_DESKTOP=KDE XDG_SESSION_TYPE=wayland ;;
  kde-x11)
    case $family in debian) install kwin-x11 ;; fedora) install kwin-x11 ;; arch) install kwin-x11 ;; esac
    start_x; kwin_x11 --replace >/tmp/compositor.log 2>&1 &
    sleep 3; export XDG_CURRENT_DESKTOP=KDE XDG_SESSION_TYPE=x11 ;;
  *) echo "unknown session $session"; exit 2 ;;
esac

name="$browser on $PRETTY_NAME, $session"
echo "== $name ($bin $launcher)"
args=(--out "$out" --ext "$ext" --profile "$profile" --name "$name")
[ -n "$launcher" ] && args+=(--launcher "$launcher") || args+=(--browser "$bin")
[ ${#extra[@]} -gt 0 ] && args+=(--extra "${extra[*]}")
status=0
node "$here/ext-check.js" "${args[@]}" || status=$?
[ -s /tmp/compositor.log ] && { echo "-- compositor log"; tail -20 /tmp/compositor.log; }
exit $status
