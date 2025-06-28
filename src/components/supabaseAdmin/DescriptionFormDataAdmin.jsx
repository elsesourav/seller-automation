import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import {
   createDescriptionFormData,
   deleteDescriptionFormData,
   listDescriptionFormData,
   updateDescriptionFormData,
} from "../../api/descriptionFormDataApi";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DescriptionFormDataAdmin() {
   const [descriptionFormData, setDescriptionFormData] = useState([]);
   const [form, setForm] = useState({
      data_id: "",
      status: "private",
      description_form_id: "",
      base_form_data_id: "",
      vertical_id: "",
      category_id: "",
   });
   const [editing, setEditing] = useState(null);
   const [userId, setUserId] = useState("");

   useEffect(() => {
      getUser();
   }, []);
   useEffect(() => {
      if (userId) fetchDescriptionFormData();
   }, [userId]);

   async function getUser() {
      const {
         data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || "");
   }

   async function fetchDescriptionFormData() {
      const { data, error } = await listDescriptionFormData();
      if (!error && data) {
         const filtered = data.filter(
            (f) => f.status === "public" || f.created_by === userId
         );
         const unique = Object.values(
            filtered.reduce((acc, cur) => {
               acc[cur.id] = cur;
               return acc;
            }, {})
         );
         setDescriptionFormData(unique);
      }
   }

   async function handleSubmit(e) {
      e.preventDefault();
      const payload = { ...form, created_by: userId };
      if (editing) {
         await updateDescriptionFormData(editing.id, payload);
      } else {
         await createDescriptionFormData(payload);
      }
      setForm({
         data_id: "",
         status: "private",
         description_form_id: "",
         base_form_data_id: "",
         vertical_id: "",
         category_id: "",
      });
      setEditing(null);
      fetchDescriptionFormData();
   }

   function handleEdit(f) {
      setForm({
         data_id: f.data_id,
         status: f.status,
         description_form_id: f.description_form_id,
         base_form_data_id: f.base_form_data_id,
         vertical_id: f.vertical_id,
         category_id: f.category_id,
      });
      setEditing(f);
   }

   async function handleDelete(id) {
      await deleteDescriptionFormData(id);
      fetchDescriptionFormData();
   }

   return (
      <Card className="max-w-xl mx-auto my-8">
         <CardHeader>
            <CardTitle>Description Form Data Admin</CardTitle>
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
                  placeholder="Description Form ID"
                  value={form.description_form_id}
                  onChange={(e) =>
                     setForm({ ...form, description_form_id: e.target.value })
                  }
               />
               <Input
                  placeholder="Base Form Data ID"
                  value={form.base_form_data_id}
                  onChange={(e) =>
                     setForm({ ...form, base_form_data_id: e.target.value })
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
               <div className="flex gap-2 mt-2">
                  <Button type="submit">{editing ? "Update" : "Create"}</Button>
                  {editing && (
                     <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                           setEditing(null);
                           setForm({
                              data_id: "",
                              status: "private",
                              description_form_id: "",
                              base_form_data_id: "",
                              vertical_id: "",
                              category_id: "",
                           });
                        }}
                     >
                        Cancel
                     </Button>
                  )}
               </div>
            </form>
            <ul className="space-y-2">
               {descriptionFormData &&
                  descriptionFormData.map((f) => (
                     <li
                        key={f.id}
                        className="flex items-center justify-between bg-muted rounded px-3 py-2"
                     >
                        <span className="font-mono text-xs">{f.id}</span>
                        {f.created_by === userId && (
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
                        )}
                     </li>
                  ))}
            </ul>
         </CardContent>
      </Card>
   );
}
