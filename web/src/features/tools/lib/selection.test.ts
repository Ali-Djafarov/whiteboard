import { beforeEach, describe, expect, it, vi } from "vitest";
import { sceneApi } from "@/entities/scene";
import { useToolStore } from "../model/toolStore";
import { deleteSelection } from "./selection";

describe("deleteSelection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useToolStore.setState({ selectedIds: [] });
  });

  it("removes the selected elements and clears the selection", () => {
    const remove = vi.spyOn(sceneApi, "removeMany").mockImplementation(() => {});
    useToolStore.setState({ selectedIds: ["a", "b"] });

    deleteSelection();

    expect(remove).toHaveBeenCalledWith(["a", "b"]);
    expect(useToolStore.getState().selectedIds).toEqual([]);
  });

  it("does nothing without a selection", () => {
    const remove = vi.spyOn(sceneApi, "removeMany").mockImplementation(() => {});

    deleteSelection();

    expect(remove).not.toHaveBeenCalled();
  });
});