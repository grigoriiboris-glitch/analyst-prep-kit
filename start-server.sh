#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"

if ! [[ "$PORT" =~ ^[0-9]{1,5}$ ]]; then
  echo "Ошибка: PORT должен быть числом от 1 до 65535." >&2
  exit 2
fi
PORT_NUMBER=$((10#$PORT))
if (( PORT_NUMBER < 1 || PORT_NUMBER > 65535 )); then
  echo "Ошибка: PORT должен быть числом от 1 до 65535." >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Ошибка: Python 3 не найден. Установите его командой: sudo apt install python3" >&2
  exit 127
fi

echo "Проверяю предыдущий сервер проекта на ${HOST}:${PORT}..."

python3 - "$ROOT_DIR" "$PORT_NUMBER" "$HOST" <<'PY'
import os
import signal
import socket
import sys
import time

root = os.path.realpath(sys.argv[1])
port = str(int(sys.argv[2]))
host = sys.argv[3]


def process_details(pid):
    proc_path = f"/proc/{pid}"
    try:
        if os.stat(proc_path).st_uid != os.getuid():
            return None
        cwd = os.path.realpath(os.readlink(f"{proc_path}/cwd"))
        with open(f"{proc_path}/cmdline", "rb") as stream:
            argv = [os.fsdecode(part) for part in stream.read().split(b"\0") if part]
        return cwd, argv
    except (FileNotFoundError, PermissionError, ProcessLookupError, OSError):
        return None


def is_project_server(pid):
    details = process_details(pid)
    if details is None:
        return False
    cwd, argv = details
    try:
        if os.path.commonpath((root, cwd)) != root:
            return False
    except ValueError:
        return False

    for index in range(len(argv) - 2):
        if argv[index] == "-m" and argv[index + 1] == "http.server" and argv[index + 2] == port:
            return True
    return False


targets = []
for entry in os.listdir("/proc"):
    if entry.isdigit():
        pid = int(entry)
        if pid != os.getpid() and is_project_server(pid):
            targets.append(pid)

for pid in targets:
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"Останавливаю предыдущий сервер проекта (PID {pid}).")
    except ProcessLookupError:
        pass
    except PermissionError:
        print(f"Нет прав для остановки PID {pid}; не использую sudo автоматически.", file=sys.stderr)

deadline = time.monotonic() + 2.5
while time.monotonic() < deadline:
    remaining = [pid for pid in targets if is_project_server(pid)]
    if not remaining:
        break
    time.sleep(0.1)

for pid in targets:
    if is_project_server(pid):
        try:
            os.kill(pid, signal.SIGKILL)
            print(f"Принудительно останавливаю зависший сервер проекта (PID {pid}).")
        except (ProcessLookupError, PermissionError):
            pass

time.sleep(0.15)

# Не завершаем посторонние приложения: сообщаем, если они заняли выбранный порт.
try:
    probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        probe.bind((host, int(port)))
    finally:
        probe.close()
except OSError as exc:
    print(
        f"Ошибка: порт {host}:{port} всё ещё занят другим процессом. "
        f"Проверьте его командой: sudo ss -ltnp 'sport = :{port}'. "
        "Этот скрипт останавливает только HTTP-сервер, запущенный из папки данного проекта.",
        file=sys.stderr,
    )
    sys.exit(2)
PY

cd "$ROOT_DIR"
echo "Запускаю Analyst Prep Kit: http://${HOST}:${PORT_NUMBER}/"
echo "Для остановки сервера нажмите Ctrl+C."
exec python3 -m http.server "$PORT_NUMBER" --bind "$HOST"
