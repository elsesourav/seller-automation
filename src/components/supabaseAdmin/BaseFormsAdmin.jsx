import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
   createBaseForm,
   deleteBaseForm,
   listBaseForms,
   updateBaseForm,
} from "../../api/baseFormsApi";

export default function BaseFormsAdmin() {
   const [baseForms, setBaseForms] = useState([]);
   const [form, setForm] = useState({
      name: "",
      description: "",
      created_by: "",
   });
   const [editing, setEditing] = useState(null);

   useEffect(() => {
      fetchBaseForms();
   }, []);

   async function fetchBaseForms() {
      const { data, error } = await listBaseForms();
      if (!error) setBaseForms(data || []);
   }

   async function handleSubmit(e) {
      e.preventDefault();
      if (editing) {
         await updateBaseForm(editing.id, form);
      } else {
         await createBaseForm(form);
      }
      setForm({ name: "", description: "", created_by: "" });
      setEditing(null);
      fetchBaseForms();
   }

   function handleEdit(f) {
      setForm({
         name: f.name,
         description: f.description,
         created_by: f.created_by,
      });
      setEditing(f);
   }

   async function handleDelete(id) {
      await deleteBaseForm(id);
      fetchBaseForms();
   }

   return (
      <Card className="max-w-xl mx-auto my-8">
         <CardHeader>
            <CardTitle>Base Forms Admin</CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
               <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
               />
               <Input
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                     setForm({ ...form, description: e.target.value })
                  }
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
                           setForm({
                              name: "",
                              description: "",
                              created_by: "",
                           });
                        }}
                     >
                        Cancel
                     </Button>
                  )}
               </div>
            </form>
            <ul className="space-y-2">
               {baseForms &&
                  baseForms.map((f) => (
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
