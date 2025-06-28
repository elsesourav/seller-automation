import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
   createForm,
   deleteForm,
   listForms,
   updateForm,
} from "../../api/formsApi";

export default function FormsAdmin() {
   const [forms, setForms] = useState([]);
   const [form, setForm] = useState({
      name: "",
      vertical_id: "",
      category_id: "",
      created_by: "",
   });
   const [editing, setEditing] = useState(null);

   useEffect(() => {
      fetchForms();
   }, []);

   async function fetchForms() {
      const { data, error } = await listForms();
      if (!error) setForms(data || []);
   }

   async function handleSubmit(e) {
      e.preventDefault();
      if (editing) {
         await updateForm(editing.id, form);
      } else {
         await createForm(form);
      }
      setForm({
         name: "",
         vertical_id: "",
         category_id: "",
         created_by: "",
      });
      setEditing(null);
      fetchForms();
   }

   function handleEdit(f) {
      setForm({
         name: f.name,
         vertical_id: f.vertical_id,
         category_id: f.category_id,
         created_by: f.created_by,
      });
      setEditing(f);
   }

   async function handleDelete(id) {
      await deleteForm(id);
      fetchForms();
   }

   return (
      <Card className="max-w-xl mx-auto my-8">
         <CardHeader>
            <CardTitle>Forms Admin</CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
               <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
               />
               <Input
                  placeholder="Vertical ID"
                  value={form.vertical_id}
                  onChange={(e) =>
                     setForm({ ...form, vertical_id: e.target.value })
                  }
               />
               <Input
                  placeholder="Category ID"
                  value={form.category_id}
                  onChange={(e) =>
                     setForm({ ...form, category_id: e.target.value })
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
                              vertical_id: "",
                              category_id: "",
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
               {forms &&
                  forms.map((f) => (
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
