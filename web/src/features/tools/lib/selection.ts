import { sceneApi } from "@/entities/scene";
import { useToolStore } from "../model/toolStore";

export function deleteSelection(): void {
  const { selectedIds, setSelection } = useToolStore.getState();
  if (selectedIds.length === 0) return;
  sceneApi.removeMany(selectedIds);
  setSelection([]);
}
