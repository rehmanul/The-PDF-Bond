import { useRoute } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductList from "@/components/admin/ProductList";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProductsPage() {
  // Route matching for different views
  const [newMatch] = useRoute("/admin/products/new");
  const [editMatch, editParams] = useRoute("/admin/products/edit/:id");
  
  // Determine which component to render based on the route
  const renderContent = () => {
    if (newMatch) {
      return <ProductForm />;
    }
    
    if (editMatch && editParams?.id) {
      const productId = parseInt(editParams.id);
      if (isNaN(productId)) {
        return <div>Invalid product ID</div>;
      }
      return <ProductForm productId={productId} />;
    }
    
    // Default to product list
    return <ProductList />;
  };
  
  // Determine page title based on the route
  const getPageTitle = () => {
    if (newMatch) {
      return "Add New Product";
    }
    
    if (editMatch) {
      return "Edit Product";
    }
    
    return "Products";
  };
  
  return (
    <AdminLayout title={getPageTitle()}>
      {renderContent()}
    </AdminLayout>
  );
}
