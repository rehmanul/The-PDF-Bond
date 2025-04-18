import { useRoute } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import BlogList from "@/components/admin/BlogList";
import BlogForm from "@/components/admin/BlogForm";

export default function AdminBlogsPage() {
  // Route matching for different views
  const [newMatch] = useRoute("/admin/blog/new");
  const [editMatch, editParams] = useRoute("/admin/blog/edit/:id");
  
  // Determine which component to render based on the route
  const renderContent = () => {
    if (newMatch) {
      return <BlogForm />;
    }
    
    if (editMatch && editParams?.id) {
      const postId = parseInt(editParams.id);
      if (isNaN(postId)) {
        return <div>Invalid blog post ID</div>;
      }
      return <BlogForm postId={postId} />;
    }
    
    // Default to blog list
    return <BlogList />;
  };
  
  // Determine page title based on the route
  const getPageTitle = () => {
    if (newMatch) {
      return "Add New Blog Post";
    }
    
    if (editMatch) {
      return "Edit Blog Post";
    }
    
    return "Blog Posts";
  };
  
  return (
    <AdminLayout title={getPageTitle()}>
      {renderContent()}
    </AdminLayout>
  );
}
