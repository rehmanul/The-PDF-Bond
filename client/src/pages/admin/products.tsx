import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateProducts } from "@/lib/product-generator";

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const productsPerPage = 10;
  
  // Set page title
  useEffect(() => {
    document.title = "Manage Products - Okkyno Admin";
  }, []);
  
  // Fetch products
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['/api/products/admin'],
    queryFn: async () => {
      // Simulating API call - in reality this would be fetching from the server
      return generateProducts();
    }
  });
  
  // Apply filters and search
  const filteredProducts = allProducts?.filter(product => {
    // Apply search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== "all") {
      if (categoryFilter === "garden-tools" && product.categoryId !== 1) return false;
      if (categoryFilter === "indoor-plants" && product.categoryId !== 2) return false;
      if (categoryFilter === "vegetable-seeds" && product.categoryId !== 3) return false;
      if (categoryFilter === "planters-pots" && product.categoryId !== 4) return false;
    }
    
    // Apply stock filter
    if (stockFilter === "in-stock" && !product.inStock) return false;
    if (stockFilter === "out-of-stock" && product.inStock) return false;
    
    return true;
  });
  
  // Apply sorting
  const sortedProducts = filteredProducts?.slice().sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "price-low") {
      return (a.salePrice || a.price) - (b.salePrice || b.price);
    } else if (sortBy === "price-high") {
      return (b.salePrice || b.price) - (a.salePrice || a.price);
    } else if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
  
  // Paginate products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts?.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = sortedProducts ? Math.ceil(sortedProducts.length / productsPerPage) : 0;
  
  const openDeleteDialog = (productId: number) => {
    setSelectedProductId(productId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteProduct = async () => {
    if (!selectedProductId) return;
    
    try {
      // In a real app, this would make an API call to delete the product
      await apiRequest('DELETE', `/api/products/${selectedProductId}`);
      
      // Invalidate cache to refetch products
      queryClient.invalidateQueries({ queryKey: ['/api/products/admin'] });
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedProductId(null);
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
          <Link href="/admin/products/add">
            <Button>
              <i className="fas fa-plus mr-2"></i> Add Product
            </Button>
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="garden-tools">Garden Tools</SelectItem>
                  <SelectItem value="indoor-plants">Indoor Plants</SelectItem>
                  <SelectItem value="vegetable-seeds">Vegetable Seeds</SelectItem>
                  <SelectItem value="planters-pots">Planters & Pots</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Stock Status</label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Products List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center border-b border-gray-200 py-4">
                  <div className="w-16 h-16 bg-gray-200 rounded mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="w-24 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or adding a new product.</p>
              <Link href="/admin/products/add">
                <Button className="mt-4">
                  <i className="fas fa-plus mr-2"></i> Add Product
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">SKU</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-center">Stock</th>
                      <th className="px-4 py-3 text-right">Featured</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentProducts?.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <img 
                              src={`${product.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80`}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover mr-3"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-gray-500 mt-1">ID: {product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {product.categoryId === 1 ? 'Garden Tools' :
                           product.categoryId === 2 ? 'Indoor Plants' :
                           product.categoryId === 3 ? 'Vegetable Seeds' :
                           product.categoryId === 4 ? 'Planters & Pots' :
                           'Other'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          SKU-{product.id.toString().padStart(6, '0')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {product.salePrice ? (
                            <div>
                              <span className="font-medium">${product.salePrice.toFixed(2)}</span>
                              <span className="text-gray-500 line-through text-xs ml-2">${product.price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="font-medium">${product.price.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-lg ${product.isFeatured ? 'text-yellow-500' : 'text-gray-300'}`}>
                            <i className="fas fa-star"></i>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 h-8 px-2">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 h-8 px-2"
                            onClick={() => openDeleteDialog(product.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts?.length || 0)} of {filteredProducts?.length} products
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <i className="fas fa-chevron-left text-xs"></i>
                    </Button>
                    
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <Button
                        key={index}
                        variant={currentPage === index + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <i className="fas fa-chevron-right text-xs"></i>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
