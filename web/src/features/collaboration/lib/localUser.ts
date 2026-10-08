const USER_KEY = "whiteboard:user";
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const USER_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#e11d48",
  "#ea580c", "#059669", "#0891b2", "#4f46e5",
];

export type LocalUser = { id: string; name: string; color: string };

const isLocalUser = (value: unknown): value is LocalUser => {
  if (typeof value !== "object" || value === null) return false;
  const { id, name, color } = value as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof name === "string" &&
    typeof color === "string" &&
    COLOR_PATTERN.test(color)
  );
};

function createLocalUser(): LocalUser {
  const id = crypto.randomUUID();
  return {
    id,
    name: `User ${id.slice(0, 4).toUpperCase()}`,
    color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)] ?? "#2563eb",
  };
}

export function getLocalUser(): LocalUser {
  try {
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isLocalUser(parsed)) return parsed;
    }
  } catch {
    // хранилище недоступно или значение повреждено: создадим нового пользователя
  }

  const user = createLocalUser();
  try {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // не сохранилось: на работу это не влияет
  }
  return user;
}