import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
   createDataStore,
   deleteDataStore,
   listDataStores,
   updateDataStore,
} from "../../api/dataStoreApi";

export default function DataStoreAdmin() {
   const [dataStore, setDataStore] = useState([]);
   const [form, setForm] = useState({ key: "", value: "", created_by: "" });
   const [editing, setEditing] = useState(null);

   useEffect(() => {
      fetchDataStore();
   }, []);

   async function fetchDataStore() {
      const data = await listDataStores();
      setDataStore(data || []);
   }

   async function handleSubmit(e) {
      e.preventDefault();
      if (editing) {
         await updateDataStore(editing.id, form);
      } else {
         await createDataStore(form);
      }
      setForm({ key: "", value: "", created_by: "" });
      setEditing(null);
      fetchDataStore();
   }

   function handleEdit(f) {
      setForm({ key: f.key, value: f.value, created_by: f.created_by });
      setEditing(f);
   }

   async function handleDelete(id) {
      await deleteDataStore(id);
      fetchDataStore();
   }

   return (
      <Card className="max-w-xl mx-auto my-8">
         <CardHeader>
            <CardTitle>Data Store Admin</CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
               <Input
                  placeholder="Key"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
               />
               <Input
                  placeholder="Value"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
               />
               <Input
                  placeholder="Created By (User ID)"
                  value={form.created_by}
                  onChange={(e) =>
                     setForm({ ...form, created_by: e.target.value })
                  }
               />
               <div className="flex gap-2 mt-2">
                  <Button type="submit">{editing ? "Update" : "Create"}</Button>
                  {editing && (
                     <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                           setEditing(null);
                           setForm({ key: "", value: "", created_by: "" });
                        }}
                     >
                        Cancel
                     </Button>
                  )}
               </div>
            </form>
            <ul className="space-y-2">
               {dataStore &&
                  dataStore.map((f) => (
                     <li
                        key={f.id}
                        className="flex items-center justify-between bg-muted rounded px-3 py-2"
                     >
                        <span className="font-mono text-xs">
                           {f.key}: {f.value}
                        </span>
                        <div className="flex gap-2">
                           <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(f)}
                           >
                              Edit
                           </Button>
                           <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(f.id)}
                           >
                              Delete
                           </Button>
                        </div>
                     </li>
                  ))}
            </ul>
         </CardContent>
      </Card>
   );
}
