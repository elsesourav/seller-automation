import { useEffect, useState } from "react";
import {
   createBaseFormData,
   deleteBaseFormData,
   listBaseFormData,
   updateBaseFormData,
} from "../../api/baseFormDataApi";


// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function BaseFormDataAdmin() {
   const [baseFormData, setBaseFormData] = useState([]);
   const [form, setForm] = useState({
      data_id: "",
      status: "private",
      base_form_id: "",
      vertical_id: "",
      category_id: "",
      created_by: "",
   });
   const [editing, setEditing] = useState(null);

   useEffect(() => {
      fetchBaseFormData();
   }, []);

   async function fetchBaseFormData() {
      const { data, error } = await listBaseFormData();
      if (!error) setBaseFormData(data || []);
   }

   async function handleSubmit(e) {
      e.preventDefault();
      if (editing) {
         await updateBaseFormData(editing.id, form);
      } else {
         await createBaseFormData(form);
      }
      setForm({
         data_id: "",
         status: "private",
         base_form_id: "",
         vertical_id: "",
         category_id: "",
         created_by: "",
      });
      setEditing(null);
      fetchBaseFormData();
   }

   function handleEdit(f) {
      setForm({
         data_id: f.data_id,
         status: f.status,
         base_form_id: f.base_form_id,
         vertical_id: f.vertical_id,
         category_id: f.category_id,
         created_by: f.created_by,
      });
      setEditing(f);
   }

   async function handleDelete(id) {
      await deleteBaseFormData(id);
      fetchBaseFormData();
   }

   return (
      <Card className="max-w-xl mx-auto my-8">
         <CardHeader>
            <CardTitle>Base Form Data Admin</CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
               <Input
                  placeholder="Data ID"
                  value={form.data_id}
                  onChange={(e) =>
                     setForm({ ...form, data_id: e.target.value })
                  }
               />
               <Input
                  placeholder="Status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
               />
               <Input
                  placeholder="Base Form ID"
                  value={form.base_form_id}
                  onChange={(e) =>
                     setForm({ ...form, base_form_id: e.target.value })
                  }
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
                  <Button type="submit" variant="default">
                     {editing ? "Update" : "Create"}
                  </Button>
                  {editing && (
                     <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                           setEditing(null);
                           setForm({
                              data_id: "",
                              status: "private",
                              base_form_id: "",
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
               {baseFormData &&
                  baseFormData.map((f) => (
                     <li
                        key={f.id}
                        className="flex items-center justify-between bg-muted rounded px-3 py-2"
                     >
                        <span className="font-mono text-xs">{f.id}</span>
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
