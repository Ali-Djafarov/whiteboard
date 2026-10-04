import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { isTextEditingTarget } from "@/shared/lib/dom";
import { getControlColumns, type ControlGroup } from "../model/controls";
import styles from "./ControlsHint.module.css";

function Group({ group }: { group: ControlGroup }) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.groupTitle}>
        {group.title}
      </h3>
      <ul className={styles.list}>
        {group.controls.map((control) => (
          <li key={`${control.keys.join("+")}:${control.action}`} className={styles.row}>
            <span className={styles.action}>{control.action}</span>
            <span className={styles.keys}>
              {control.keys.map((key, index) => (
                <Fragment key={`${index}:${key}`}>
                  {index > 0 && <span className={styles.plus}>+</span>}
                  <kbd className={styles.kbd}>{key}</kbd>
                </Fragment>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ControlsHint() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const columns = useMemo(() => getControlColumns(), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !isTextEditingTarget(e.target)
      ) {
        e.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Справка по управлению"
        title="Справка (?)"
      >
        <HelpCircle size={20} />
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className={styles.content}>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              Справка
            </h2>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setOpen(false)}
              aria-label="Закрыть справку"
            >
              <X size={18} />
            </button>
          </header>

          <div className={styles.columns}>
            <div className={styles.column}>
              {columns.left.map((group) => (
                <Group key={group.id} group={group} />
              ))}
            </div>
            <div className={styles.column}>
              {columns.right.map((group) => (
                <Group key={group.id} group={group} />
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}