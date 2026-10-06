export type Control = { keys: string[]; action: string };
export type ControlGroup = { id: string; title: string; controls: Control[] };
export type ControlColumns = { left: ControlGroup[]; right: ControlGroup[] };

export function detectMac(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)
  );
}

export function getControlColumns(
  isMac: boolean = detectMac(),
): ControlColumns {
  const mod = isMac ? "⌘" : "Ctrl";

  return {
    left: [
      {
        id: "canvas",
        title: "Холст",
        controls: [
          {
            keys: ["Колесо"],
            action: "Двигать холст (на трекпаде: два пальца)",
          },
          { keys: [mod, "Колесо"], action: "Масштаб к курсору" },
          { keys: ["Щипок"], action: "Масштаб на трекпаде" },
          { keys: ["Пробел", "Перетаскивание"], action: "Двигать холст" },
          {
            keys: ["Средняя кнопка", "Перетаскивание"],
            action: "Двигать холст",
          },
        ],
      },
      {
        id: "editing",
        title: "Выделение и правка",
        controls: [
          { keys: ["Клик"], action: "Выделить фигуру" },
          {
            keys: ["Shift", "Клик"],
            action: "Добавить или убрать из выделения",
          },
          {
            keys: ["Перетаскивание"],
            action: "Выделить рамкой (в режиме выбора)",
          },
          { keys: ["Delete"], action: "Удалить выделенное" },
          { keys: ["Esc"], action: "Отменить действие или снять выделение" },
          { keys: ["?"], action: "Показать или скрыть справку" },
        ],
      },
    ],
    right: [
      {
        id: "tools",
        title: "Инструменты",
        controls: [
          { keys: ["V"], action: "Выбор" },
          { keys: ["R"], action: "Прямоугольник" },
          { keys: ["O"], action: "Эллипс" },
          {
            keys: ["Перетаскивание"],
            action: "Нарисовать фигуру (после R или O)",
          },
          { keys: ["A"], action: "Стрелка" },
          {
            keys: ["Shift", "Перетаскивание"],
            action: "Стрелка под углом, кратным 15°",
          },
        ],
      },
    ],
  };
}
