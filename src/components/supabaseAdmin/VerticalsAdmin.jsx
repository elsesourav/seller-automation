import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
   createVertical,
   deleteVertical,
   listVerticals,
   updateVertical,
} from "../../api/verticalsApi";

export default function VerticalsAdmin() {
   const [verticals, setVerticals] = useState([]);
   const [form, setForm] = useState({ name: "", created_by: "" });
   const [editing, setEditing] = useState(null);

   useEffect(() => {
      fetchVerticals();
   }, []);

   async function fetchVerticals() {
      const { data, error } = await listVerticals();
      if (!error) setVerticals(data || []);
   }

   async function handleSubmit(e) {
      e.preventDefault();
      if (editing) {
         await updateVertical(editing.id, form);
      } else {
         await createVertical(form);
      }
      setForm({ name: "", created_by: "" });
      setEditing(null);
      fetchVerticals();
   }

   function handleEdit(f) {
      setForm({ name: f.name, created_by: f.created_by });
      setEditing(f);
   }

   async function handleDelete(id) {
      await deleteVertical(id);
      fetchVerticals();
   }

   return (
      <Card className="max-w-xl mx-auto my-8">
         <CardHeader>
            <CardTitle>Verticals Admin</CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
               <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                           setForm({ name: "", created_by: "" });
                        }}
                     >
                        Cancel
                     </Button>
                  )}
               </div>
            </form>
            <ul className="space-y-2">
               {verticals &&
                  verticals.map((f) => (
                     <li
                        key={f.id}
                        className="flex items-center justify-between bg-muted rounded px-3 py-2"
                     >
                        <span className="font-mono text-xs">{f.name}</span>
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
