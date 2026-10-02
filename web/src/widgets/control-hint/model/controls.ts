export type Control = { keys: string[]; action: string };

export function detectMac(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
}

export function getControls(isMac: boolean = detectMac()): Control[] {
  const mod = isMac ? "⌘" : "Ctrl";
  return [
    { keys: ["Колесо"], action: "Двигать холст (на трекпаде: два пальца)" },
    { keys: [mod, "Колесо"], action: "Масштаб к курсору" },
    { keys: ["Щипок"], action: "Масштаб на трекпаде" },
    { keys: ["Пробел", "Перетаскивание"], action: "Двигать холст" },
    { keys: ["Средняя кнопка", "Перетаскивание"], action: "Двигать холст" },
    { keys: ["?"], action: "Показать или скрыть подсказку" },
  ];
}