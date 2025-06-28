import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
   createProduct,
   deleteProduct,
   listProducts,
   updateProduct,
   getProductsByUser,
} from "../../api/productsApi";

export default function ProductsAdmin({ userId }) {
   const [products, setProducts] = useState([]);
   const [form, setForm] = useState({
      name: "",
      label: "",
      status: "public",
      vertical_id: "",
      category_id: "",
      created_by: userId,
      price: "",
      quantity_per_kg: "",
      sku_id: "",
      increment_per_rupee: "",
   });
   const [editing, setEditing] = useState(null);

   useEffect(() => {
      fetchProducts();
      // eslint-disable-next-line
   }, [userId]);

   async function fetchProducts() {
      // Show only public products and those created by this user
      const publicProducts = await listProducts();
      const userProducts = userId
         ? await getProductsByUser(userId)
         : { data: [] };
      let merged = publicProducts;
      if (userProducts.data) {
         const userIds = new Set(merged.map((f) => f.id));
         merged = merged.concat(
            userProducts.data.filter((f) => !userIds.has(f.id))
         );
      }
      setProducts(merged || []);
   }

   async function handleSubmit(e) {
      e.preventDefault();
      if (editing) {
         await updateProduct(editing.id, form, userId);
      } else {
         await createProduct({ ...form, created_by: userId });
      }
      setForm({
         name: "",
         label: "",
         status: "public",
         vertical_id: "",
         category_id: "",
         created_by: userId,
         price: "",
         quantity_per_kg: "",
         sku_id: "",
         increment_per_rupee: "",
      });
      setEditing(null);
      fetchProducts();
   }

   function handleEdit(f) {
      setForm({
         name: f.name,
         label: f.label,
         status: f.status,
         vertical_id: f.vertical_id,
         category_id: f.category_id,
         created_by: f.created_by,
         price: f.price,
         quantity_per_kg: f.quantity_per_kg,
         sku_id: f.sku_id,
         increment_per_rupee: f.increment_per_rupee,
      });
      setEditing(f);
   }

   async function handleDelete(id) {
      await deleteProduct(id, userId);
      fetchProducts();
   }

   return (
      <Card className="max-w-xl mx-auto my-8">
         <CardHeader>
            <CardTitle>Products Admin</CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
               <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
               />
               <Input
                  placeholder="Label"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
               />
               <Input
                  placeholder="Status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
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
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
               />
               <Input
                  placeholder="Quantity per KG"
                  value={form.quantity_per_kg}
                  onChange={(e) =>
                     setForm({ ...form, quantity_per_kg: e.target.value })
                  }
               />
               <Input
                  placeholder="SKU ID"
                  value={form.sku_id}
                  onChange={(e) => setForm({ ...form, sku_id: e.target.value })}
               />
               <Input
                  placeholder="Increment per Rupee"
                  value={form.increment_per_rupee}
                  onChange={(e) =>
                     setForm({ ...form, increment_per_rupee: e.target.value })
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
                              label: "",
                              status: "public",
                              vertical_id: "",
                              category_id: "",
                              created_by: userId,
                              price: "",
                              quantity_per_kg: "",
                              sku_id: "",
                              increment_per_rupee: "",
                           });
                        }}
                     >
                        Cancel
                     </Button>
                  )}
               </div>
            </form>
            <ul className="space-y-2">
               {products &&
                  products.map((f) => (
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
