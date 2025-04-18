import { useState, useEffect } from "react";
import { useRouter } from "wouter";
import AdminLayout from "@/components/admin/layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { insertProductSchema } from "@shared/schema";
import { productImages } from "@/lib/data";
import { sampleCategories } from "@/lib/data";

// Extend the schema for form validation
const formSchema = insertProductSchema.extend({
  // Add client-side validation rules
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  salePrice: z.coerce.number().positive("Sale price must be positive").optional().nullable(),
  imageUrl: z.string().url("Please enter a valid image URL"),
  categoryId: z.coerce.number().int().positive("Please select a category"),
});

export default function AddProduct() {
  const [, navigate] = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  
  // Set page title
  useEffect(() => {
    document.title = "Add Product - Okkyno Admin";
  }, []);
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      // Simulating API call
      return sampleCategories;
    }
  });
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      salePrice: null,
      imageUrl: "",
      categoryId: 0,
      inStock: true,
      isFeatured: false,
      isNew: true,
      isBestseller: false,
      isOrganic: false,
    },
  });
  
  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };
  
  // Update slug when name changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name') {
        const nameValue = value.name as string;
        if (nameValue) {
          form.setValue('slug', generateSlug(nameValue));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Handle sample image selection
  const handleSelectSampleImage = (imageUrl: string) => {
    form.setValue('imageUrl', imageUrl, { shouldValidate: true });
    setPreviewUrl(imageUrl);
  };
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would make an API call to create the product
      await apiRequest('POST', '/api/products', data);
      
      // Invalidate cache to refetch products
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/admin'] });
      
      toast({
        title: "Product created successfully",
        description: "The product has been added to your catalog.",
      });
      
      navigate("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <Button variant="outline" onClick={() => navigate("/admin/products")}>
            <i className="fas fa-arrow-left mr-2"></i> Back to Products
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info Card */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              URL-friendly version of the name (auto-generated)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter product description" 
                                rows={5} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Pricing Card */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Pricing</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regular Price *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  className="pl-8" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="salePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale Price (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  className="pl-8" 
                                  {...field}
                                  value={field.value || ''} 
                                  onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : null;
                                    field.onChange(value);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Leave empty if not on sale
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Media Card */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Product Image</h2>
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter image URL" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter a URL for the product image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Image Preview */}
                    {form.watch('imageUrl') && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Preview:</h3>
                        <div className="border rounded-md p-2 w-40 h-40">
                          <img 
                            src={`${form.watch('imageUrl')}?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80`}
                            alt="Product preview"
                            className="w-full h-full object-cover rounded"
                            onError={() => setPreviewUrl("")}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Or choose a sample image:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        {Object.values(productImages).flat().slice(0, 8).map((img, idx) => (
                          <div 
                            key={idx} 
                            className={`border rounded-md cursor-pointer overflow-hidden h-24 ${
                              form.watch('imageUrl') === img ? 'ring-2 ring-primary' : 'hover:border-primary'
                            }`}
                            onClick={() => handleSelectSampleImage(img)}
                          >
                            <img 
                              src={`${img}?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80`}
                              alt={`Sample ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar Section */}
              <div className="space-y-6">
                {/* Organization Card */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Organization</h2>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categoriesLoading ? (
                                  <SelectItem value="0" disabled>Loading categories...</SelectItem>
                                ) : (
                                  categories?.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Inventory Card */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Inventory</h2>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="inStock"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2">
                            <FormLabel>In Stock</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Product Attributes Card */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Product Attributes</h2>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2">
                            <FormLabel>Featured Product</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isNew"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2">
                            <FormLabel>New Product</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isBestseller"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2">
                            <FormLabel>Bestseller</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isOrganic"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2">
                            <FormLabel>Organic</FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Product..." : "Create Product"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
