import { useEffect, useState } from "react";
import { FiBox, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { getAllCategories } from "../../../api/categoriesApi";
import {
   createProduct,
   deleteProduct,
   getAllProducts,
   updateProduct,
} from "../../../api/productsApi";
import { fetchAllUsers, getUserId } from "../../../api/usersApi";
import { getAllVerticals } from "../../../api/verticalsApi";
import { formatIndianNumber } from "../../../lib/utils";
import ConfirmDialog from "../../ConfirmDialog";
import CustomAlert from "../../CustomAlert";
import { NumberInput, SelectInput, TextInput } from "../../inputs";

export default function Product() {
   const [products, setProducts] = useState([]);
   const [verticals, setVerticals] = useState([]);
   const [categories, setCategories] = useState([]);
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [editProduct, setEditProduct] = useState(null);
   const [showEditSection, setShowEditSection] = useState(false);
   const [form, setForm] = useState({
      name: "",
      label: "",
      status: "public",
      vertical_id: "",
      category_id: "",
      price: "",
      quantity_per_kg: "",
      sku_id: "",
      increment_per_rupee: "",
   });
   const [confirm, setConfirm] = useState({ open: false, id: null });
   const [alert, setAlert] = useState(null);
   const [search, setSearch] = useState("");
   const [filterMine, setFilterMine] = useState("mine");
   const [filterVertical, setFilterVertical] = useState("");
   const [filterCategory, setFilterCategory] = useState("");

   useEffect(() => {
      async function fetchData() {
         setLoading(true);
         const [p, v, c, u] = await Promise.all([
            getAllProducts(),
            getAllVerticals(),
            getAllCategories(),
            fetchAllUsers(),
         ]);
         setProducts(p);
         setVerticals(v);
         setCategories(c);
         setUsers(u);
         setLoading(false);
      }
      fetchData();
   }, []);

   function ProductForm({
      initialForm,
      verticals,
      onSubmit,
      onCancel,
      submitLabel,
      showDelete,
      onDelete,
   }) {
      const [form, setForm] = useState(initialForm);

      useEffect(() => {
         const price = parseFloat(form.price);
         const qty = parseFloat(form.quantity_per_kg);
         if (!isNaN(price) && price > 0 && !isNaN(qty) && qty > 0) {
            const inc = Math.floor((qty / price) * 2).toString();
            if (form.increment_per_rupee !== inc) {
               setForm((f) => ({ ...f, increment_per_rupee: inc }));
            }
         }
         // eslint-disable-next-line
      }, [form.price, form.quantity_per_kg]);

      useEffect(() => {
         setForm(initialForm);
      }, [initialForm]);

      const handleSubmit = (e) => {
         e && e.preventDefault();
         onSubmit(form);
      };

      // Use categories filtered by the selected vertical in the form
      const formCategories = getFormCategories(form.vertical_id);

      return (
         <form onSubmit={handleSubmit}>
            <TextInput
               placeholder="Product Name"
               value={form.name}
               onChange={(val) => setForm((f) => ({ ...f, name: val }))}
               className="mb-3"
            />
            <TextInput
               placeholder="Label"
               value={form.label}
               onChange={(val) => setForm((f) => ({ ...f, label: val }))}
               className="mb-3"
            />
            <SelectInput
               value={form.status || "public"}
               onChange={(val) => setForm((f) => ({ ...f, status: val }))}
               options={[
                  { value: "public", label: "Public" },
                  { value: "private", label: "Private" },
               ]}
               className="mb-3"
            />
            <SelectInput
               value={form.vertical_id}
               onChange={(val) =>
                  setForm((f) => ({ ...f, vertical_id: val, category_id: "" }))
               }
               options={verticals.map((v) => ({ value: v.id, label: v.name }))}
               placeholder="Select Vertical"
               className="mb-3"
            />
            <SelectInput
               value={form.category_id}
               onChange={(val) => setForm((f) => ({ ...f, category_id: val }))}
               options={formCategories.map((c) => ({
                  value: c.id,
                  label: c.name,
               }))}
               placeholder="Select Category"
               className="mb-3"
            />
            <NumberInput
               placeholder="Price"
               value={form.price}
               onChange={(val) => setForm((f) => ({ ...f, price: val }))}
               className="mb-3"
               useIndianFormat={true}
            />
            <NumberInput
               placeholder="Quantity per Kg"
               value={form.quantity_per_kg}
               onChange={(val) =>
                  setForm((f) => ({ ...f, quantity_per_kg: val }))
               }
               className="mb-3"
               useIndianFormat={true}
            />
            <TextInput
               placeholder="SKU ID *"
               value={form.sku_id}
               onChange={(val) => setForm((f) => ({ ...f, sku_id: val }))}
               className="mb-3"
               required={true}
            />
            <NumberInput
               placeholder="Increment per Rupee"
               value={form.increment_per_rupee}
               onChange={(val) =>
                  setForm((f) => ({ ...f, increment_per_rupee: val }))
               }
               className="mb-3"
               useIndianFormat={true}
            />
            <div className="flex flex-row gap-2 justify-between mt-4">
               {showDelete ? (
                  <button
                     type="button"
                     className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded hover:from-red-600 hover:to-pink-700 flex items-center gap-1 cursor-pointer"
                     onClick={onDelete}
                  >
                     <FiTrash2 /> Delete
                  </button>
               ) : (
                  <span />
               )}
               <div className="flex gap-2">
                  <button
                     type="button"
                     className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer"
                     onClick={onCancel}
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded hover:from-green-600 hover:to-blue-700 cursor-pointer"
                  >
                     {submitLabel}
                  </button>
               </div>
            </div>
         </form>
      );
   }

   // Handlers
   const handleAdd = async (formData) => {
      try {
         await createProduct(formData);
         setAlert({ type: "success", message: "Product created!" });
         setShowModal(false);
         setForm({
            name: "",
            label: "",
            status: "public",
            vertical_id: "",
            category_id: "",
            price: "",
            quantity_per_kg: "",
            sku_id: "",
            increment_per_rupee: "",
         });
         setProducts(await getAllProducts());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };
   const handleEdit = async (formData) => {
      try {
         await updateProduct(editProduct.id, formData);
         setAlert({ type: "success", message: "Product updated!" });
         setEditProduct(null);
         setShowModal(false);
         setForm({
            name: "",
            label: "",
            status: "public",
            vertical_id: "",
            category_id: "",
            price: "",
            quantity_per_kg: "",
            sku_id: "",
            increment_per_rupee: "",
         });
         setProducts(await getAllProducts());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };
   const handleDelete = async (id) => {
      try {
         await deleteProduct(id);
         setAlert({ type: "success", message: "Product deleted!" });
         setProducts(await getAllProducts());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   // Filter categories by selected vertical (for the main filter bar)
   const filteredCategories = filterVertical
      ? categories.filter((c) => c.vertical_id === filterVertical)
      : categories;

   // Helper: filter categories for the form, based on form.vertical_id
   function getFormCategories(verticalId) {
      return verticalId
         ? categories.filter((c) => c.vertical_id === verticalId)
         : categories;
   }

   // Helper: get username by user id
   function getUsername(userId) {
      // You may want to cache this in a real app
      const user = users.find((u) => u.id === userId);
      return user?.username || userId?.slice(0, 8) || "-";
   }

   // Filter products based on search and filters
   const filteredProducts = products.filter((p) => {
      // Filter by ownership
      if (filterMine === "mine" && p.created_by !== getUserId()) return false;
      // Filter by vertical
      if (filterVertical && p.vertical_id !== filterVertical) return false;
      // Filter by category
      if (filterCategory && p.category_id !== filterCategory) return false;
      // Search by name or label
      if (search) {
         const s = search.toLowerCase();
         const name = (p.name || "").toLowerCase();
         const label = (p.label || "").toLowerCase();
         if (!name.includes(s) && !label.includes(s)) return false;
      }
      return true;
   });

   return (
      <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700 text-white shadow-md">
         {alert && (
            <CustomAlert
               type={alert.type}
               message={alert.message}
               onClose={() => setAlert(null)}
            />
         )}
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <FiBox className="text-green-400" /> Products
            </h2>
            <button
               className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 font-medium shadow flex items-center gap-2 cursor-pointer"
               onClick={() => {
                  setShowModal(true);
                  setEditProduct(null);
                  setForm({
                     name: "",
                     label: "",
                     status: "public",
                     vertical_id: "",
                     category_id: "",
                     price: "",
                     quantity_per_kg: "",
                     sku_id: "",
                     increment_per_rupee: "",
                  });
               }}
            >
               <FiPlus /> Add Product
            </button>
         </div>
         <div className="flex w-full justify-between flex-col md:flex-row md:items-end md:gap-4 gap-2 mb-4">
            <TextInput
               placeholder="Search by name or label"
               value={search}
               onChange={setSearch}
               className="md:w-64 w-full"
            />
            <SelectInput
               value={filterMine}
               onChange={setFilterMine}
               options={[
                  { value: "mine", label: "My Products" },
                  { value: "all", label: "All Products" },
               ]}
               className="md:w-48 w-full"
            />
            <SelectInput
               value={filterVertical}
               onChange={(val) => {
                  setFilterVertical(val);
                  setFilterCategory("");
               }}
               options={verticals.map((v) => ({ value: v.id, label: v.name }))}
               placeholder="By Vertical"
               className="md:w-48 w-full"
            />
            <SelectInput
               value={filterCategory}
               onChange={setFilterCategory}
               options={filteredCategories.map((c) => ({
                  value: c.id,
                  label: c.name,
               }))}
               placeholder="By Category"
               className="md:w-48 w-full"
            />
         </div>
         {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
         ) : (
            <div className="flex flex-col md:flex-row gap-6">
               {/* Product List */}
               <div className="flex-1">
                  <div className="relative w-full bg-gray-800/70 rounded-2xl overflow-hidden border border-gray-700 shadow-lg">
                     <div className="flex gap-2 bg-gradient-to-r from-gray-900/80 to-gray-800/80 text-gray-200 px-4 py-2 font-semibold text-sm rounded-t-2xl">
                        <p className="flex-5 text-left">Name</p>
                        <p className="flex-2 text-left">Category</p>
                        <p className="w-20 text-left">Price</p>
                        <p className="w-28 text-left">Qty/Kg</p>
                        <p className="w-16 text-left">SKU</p>
                        <p className="w-20 text-left">Inc/Rupee</p>
                        <p className="w-24 text-left">Owner</p>
                        <p className="w-16 text-center">Actions</p>
                     </div>
                     <div>
                        {filteredProducts.length === 0 ? (
                           <div className="text-center text-gray-500 py-4 bg-gray-900/60">
                              No products
                           </div>
                        ) : (
                           filteredProducts.map((p) => (
                              <div
                                 key={p.id}
                                 className="flex items-center gap-2 border-t border-gray-700 hover:bg-gray-700/40 transition-colors duration-150 group px-4 py-2"
                              >
                                 <div className="flex-5 whitespace-nowrap text-white group-hover:text-green-200 flex items-center gap-1">
                                    {p.name}{" "}
                                    {p.label && (
                                       <span className="text-gray-400">
                                          ({p.label})
                                       </span>
                                    )}
                                    <span className="w-4 h-full grid place-items-center">
                                       <span
                                          className={`p-2 rounded-full ${
                                             p.status === "private"
                                                ? "bg-pink-700/40 text-pink-300"
                                                : "bg-blue-700/40 text-blue-300"
                                          }`}
                                       />
                                    </span>
                                 </div>
                                 <div className="flex-2 whitespace-nowrap text-gray-200">
                                    {categories.find(
                                       (c) => c.id === p.category_id
                                    )?.name || "-"}
                                 </div>
                                 <div className="w-20 text-left text-gray-200">
                                    {formatIndianNumber(p.price)}
                                 </div>
                                 <div className="w-28 text-left text-gray-200">
                                    {formatIndianNumber(p.quantity_per_kg)}
                                 </div>
                                 <div className="w-16 text-left text-gray-200">
                                    {p.sku_id}
                                 </div>
                                 <div className="w-20 text-left text-gray-200">
                                    {formatIndianNumber(p.increment_per_rupee)}
                                 </div>
                                 <div className="w-24 text-left text-gray-200">
                                    {getUsername(p.created_by)}
                                 </div>
                                 <div className="w-16 flex gap-2 justify-center">
                                    {p.created_by === getUserId() && (
                                       <button
                                          className="text-blue-400 hover:text-blue-200 flex items-center gap-1 cursor-pointer"
                                          onClick={() => {
                                             setEditProduct(p);
                                             setForm({
                                                name: p.name,
                                                label: p.label,
                                                status: p.status,
                                                vertical_id: p.vertical_id,
                                                category_id: p.category_id,
                                                price: p.price,
                                                quantity_per_kg:
                                                   p.quantity_per_kg,
                                                sku_id: p.sku_id,
                                                increment_per_rupee:
                                                   p.increment_per_rupee,
                                             });
                                             setShowEditSection(true);
                                          }}
                                       >
                                          <FiEdit2 />
                                       </button>
                                    )}
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Edit Section (floating right overlay) */}
         {showEditSection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
               <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 w-full max-w-lg">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <FiBox className="text-green-400" />
                     Edit Product
                  </h3>
                  <ProductForm
                     initialForm={form}
                     verticals={verticals}
                     onSubmit={async (formData) => {
                        await handleEdit(formData);
                        setShowEditSection(false);
                     }}
                     onCancel={() => {
                        setShowEditSection(false);
                        setEditProduct(null);
                     }}
                     submitLabel="Update"
                     showDelete={editProduct?.created_by === getUserId()}
                     onDelete={() =>
                        setConfirm({ open: true, id: editProduct.id })
                     }
                  />
               </div>
            </div>
         )}

         {/* Modal for Add Product */}
         {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
               <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 w-full max-w-lg">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <FiBox className="text-green-400" />
                     Add Product
                  </h3>
                  <ProductForm
                     initialForm={form}
                     verticals={verticals}
                     onSubmit={async (formData) => {
                        await handleAdd(formData);
                        setShowModal(false);
                     }}
                     onCancel={() => {
                        setShowModal(false);
                        setEditProduct(null);
                     }}
                     submitLabel="Add"
                     showDelete={false}
                  />
               </div>
            </div>
         )}

         {/* Confirm Dialog for Delete */}
         <ConfirmDialog
            open={confirm.open}
            title="Delete Product"
            message="Are you sure you want to delete this product?"
            onConfirm={async () => {
               await handleDelete(confirm.id);
               setShowModal(false);
               setEditProduct(null);
               setConfirm({ open: false, id: null });
            }}
            onCancel={() => setConfirm({ open: false, id: null })}
         />
      </div>
   );
}
