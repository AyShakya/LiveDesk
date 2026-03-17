import { useState } from "react";
import { updateDocument, deleteDocument } from "../api/documents";

interface Props {
  docId: string;
  title: string;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

export default function DocumentMenu({
  docId,
  title,
  onRename,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  async function handleRename() {
    if (!newTitle.trim()) return;

    const updated = (await updateDocument(String(docId), {
      title: newTitle,
    })) as { title: string };

    onRename(updated.title);
    setRenaming(false);
    setOpen(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this document?")) return;

    await deleteDocument(String(docId));

    onDelete();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 text-gray-500 hover:text-black"
      >
        ⋯
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-md">
          <button
            onClick={() => {
              setRenaming(true);
              setOpen(false);
            }}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            Rename
          </button>

          <button
            onClick={handleDelete}
            className="block w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}

      {renaming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[350px]">
            <h3 className="font-semibold mb-4">Rename Document</h3>

            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenaming(false)}
                className="px-3 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleRename}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
