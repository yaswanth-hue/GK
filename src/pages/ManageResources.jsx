import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const instruments = [
  "drums",
  "flute",
  "guitar",
  "tabla",
  "harmonium",
  "saxophone",
  "keyboard",
  "violin",
];
const levels = ["beginner", "intermediate", "advanced"];
const types = ["video", "journal", "pdf", "course"];

const ManageResources = () => {
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "resources"));
    const allResources = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setResources(allResources);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this?");
    if (!confirm) return;
    await deleteDoc(doc(db, "resources", id));
    fetchResources();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "resources", editingResource.id);
      const { id, ...updatedData } = editingResource;
      await updateDoc(docRef, updatedData);
      alert("Resource updated successfully!");
      setEditingResource(null);
      fetchResources();
    } catch (err) {
      console.error("Error updating resource:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Resources</h1>

      {loading ? (
        <p>Loading resources...</p>
      ) : resources.length === 0 ? (
        <p>No resources found.</p>
      ) : (
        <div className="space-y-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-4 border rounded flex justify-between items-start"
            >
              <div>
                <p className="font-semibold text-lg">{res.title}</p>
                <p className="text-sm text-gray-600 mb-1">
                  Instrument: {res.instrument} | Level: {res.level} | Type:{" "}
                  {res.resourceType}
                </p>
                <a
                  href={res.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {res.link}
                </a>
              </div>
              <div className="space-x-2">
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => setEditingResource(res)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => handleDelete(res.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingResource && (
        <div className="mt-8 p-4 border rounded bg-gray-100">
          <h2 className="text-xl font-semibold mb-4">Edit Resource</h2>
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={editingResource.title}
              onChange={(e) =>
                setEditingResource({ ...editingResource, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Link"
              value={editingResource.link}
              onChange={(e) =>
                setEditingResource({ ...editingResource, link: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
            <select
              value={editingResource.instrument}
              onChange={(e) =>
                setEditingResource({
                  ...editingResource,
                  instrument: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            >
              {instruments.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
            <select
              value={editingResource.level}
              onChange={(e) =>
                setEditingResource({
                  ...editingResource,
                  level: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
            <select
              value={editingResource.resourceType}
              onChange={(e) =>
                setEditingResource({
                  ...editingResource,
                  resourceType: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageResources;
