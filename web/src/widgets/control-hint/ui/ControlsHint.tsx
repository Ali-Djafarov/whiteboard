import { Fragment, useEffect, useMemo, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { isTextEditingTarget } from "@/shared/lib/dom";
import { getControls } from "../model/controls";
import styles from "./ControlsHint.module.css";

const SEEN_KEY = "whiteboard:controls-hint-seen";

function readSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    console.log("хранилище недоступно");
  }
}

export function ControlsHint() {
  const [open, setOpen] = useState(() => !readSeen());
  const controls = useMemo(() => getControls(), []);

  useEffect(() => {
    if (!open) markSeen();
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (
        e.key === "?" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !isTextEditingTarget(e.target)
      ) {
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.root}>
      {open && (
        <section className={styles.panel} aria-label="Управление холстом">
          <header className={styles.header}>
            <h2 className={styles.title}>Управление</h2>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setOpen(false)}
              aria-label="Закрыть подсказку"
            >
              <X size={16} />
            </button>
          </header>
          <ul className={styles.list}>
            {controls.map((control) => (
              <li key={control.keys.join("+")} className={styles.row}>
                <span className={styles.keys}>
                  {control.keys.map((key, index) => (
                    <Fragment key={key}>
                      {index > 0 && <span className={styles.plus}>+</span>}
                      <kbd className={styles.kbd}>{key}</kbd>
                    </Fragment>
                  ))}
                </span>
                <span className={styles.action}>{control.action}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Управление холстом"
        title="Управление (?)"
      >
        <HelpCircle size={20} />
      </button>
    </div>
  );
}
