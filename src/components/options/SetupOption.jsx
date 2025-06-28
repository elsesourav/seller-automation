import BaseFormDataAdmin from "../supabaseAdmin/BaseFormDataAdmin";
import BaseFormsAdmin from "../supabaseAdmin/BaseFormsAdmin";
import CategoriesAdmin from "../supabaseAdmin/CategoriesAdmin";
import DataStoreAdmin from "../supabaseAdmin/DataStoreAdmin";
import DescriptionFormDataAdmin from "../supabaseAdmin/DescriptionFormDataAdmin";
import DescriptionFormsAdmin from "../supabaseAdmin/DescriptionFormsAdmin";
import FormsAdmin from "../supabaseAdmin/FormsAdmin";
import ProductsAdmin from "../supabaseAdmin/ProductsAdmin";
import VerticalsAdmin from "../supabaseAdmin/VerticalsAdmin";

export default function SetupContent() {
   return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
         <VerticalsAdmin />
         <CategoriesAdmin />
         <ProductsAdmin />
         <FormsAdmin />
         <BaseFormsAdmin />
         <DescriptionFormsAdmin />
         <DataStoreAdmin />
         <BaseFormDataAdmin />
         <DescriptionFormDataAdmin />
      </div>
   );
}
