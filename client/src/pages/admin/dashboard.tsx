import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { generateProducts } from "@/lib/product-generator";
import { generateBlogPosts } from "@/lib/blog-generator";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminDashboard() {
  const { user } = useAdmin();
  
  // Set page title
  useEffect(() => {
    document.title = "Admin Dashboard - Okkyno Gardening Supplies";
  }, []);

  // Fetch products data
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products/admin'],
    queryFn: async () => {
      // Simulating API call - in reality this would be fetching from the server
      return generateProducts();
    }
  });

  // Fetch blog posts data
  const { data: blogPosts, isLoading: blogPostsLoading } = useQuery({
    queryKey: ['/api/blog/posts/admin'],
    queryFn: async () => {
      // Simulating API call - in reality this would be fetching from the server
      return generateBlogPosts();
    }
  });

  // Generate sales data (random for demo)
  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
    { name: 'Aug', sales: 2900 },
    { name: 'Sep', sales: 3200 },
    { name: 'Oct', sales: 4500 },
    { name: 'Nov', sales: 6100 },
    { name: 'Dec', sales: 7200 },
  ];

  // Generate website traffic data (random for demo)
  const trafficData = [
    { name: 'Mon', visits: 1200 },
    { name: 'Tue', visits: 1300 },
    { name: 'Wed', visits: 1400 },
    { name: 'Thu', visits: 1100 },
    { name: 'Fri', visits: 1500 },
    { name: 'Sat', visits: 2200 },
    { name: 'Sun', visits: 1900 },
  ];

  // Category distribution data
  const categoryData = [
    { name: 'Garden Tools', value: 120 },
    { name: 'Indoor Plants', value: 85 },
    { name: 'Vegetable Seeds', value: 64 },
    { name: 'Planters & Pots', value: 96 },
    { name: 'Others', value: 42 },
  ];

  const COLORS = ['#3a7d44', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b'];

  // Recent orders data
  const recentOrders = [
    { id: '#ORD-1234', customer: 'Jennifer P.', date: '2023-06-15', total: 122.99, status: 'Delivered' },
    { id: '#ORD-1235', customer: 'Robert T.', date: '2023-06-14', total: 78.50, status: 'Processing' },
    { id: '#ORD-1236', customer: 'Melissa K.', date: '2023-06-14', total: 45.99, status: 'Shipped' },
    { id: '#ORD-1237', customer: 'David M.', date: '2023-06-13', total: 189.75, status: 'Delivered' },
    { id: '#ORD-1238', customer: 'Sarah J.', date: '2023-06-12', total: 34.50, status: 'Processing' },
  ];

  // Generate summary metrics
  const totalProducts = products?.length || 0;
  const totalBlogPosts = blogPosts?.length || 0;
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const averageOrderValue = totalSales / 1200; // Assuming 1200 orders

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username || 'Admin'}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Products</p>
                  <h3 className="text-3xl font-bold mt-1">{totalProducts}</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <i className="fas fa-leaf text-primary text-xl"></i>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-4">
                <i className="fas fa-arrow-up mr-1"></i> 12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Sales</p>
                  <h3 className="text-3xl font-bold mt-1">${(totalSales / 1000).toFixed(1)}k</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <i className="fas fa-chart-line text-blue-600 text-xl"></i>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-4">
                <i className="fas fa-arrow-up mr-1"></i> 8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Avg. Order Value</p>
                  <h3 className="text-3xl font-bold mt-1">${averageOrderValue.toFixed(2)}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <i className="fas fa-shopping-cart text-purple-600 text-xl"></i>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-4">
                <i className="fas fa-arrow-up mr-1"></i> 3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Blog Posts</p>
                  <h3 className="text-3xl font-bold mt-1">{totalBlogPosts}</h3>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <i className="fas fa-file-alt text-orange-600 text-xl"></i>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-4">
                <i className="fas fa-arrow-up mr-1"></i> 5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                    <Bar dataKey="sales" fill="#3a7d44" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Website Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trafficData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Visits']} />
                    <Line type="monotone" dataKey="visits" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Product Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`${value} items`, 'Quantity']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Order ID</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-primary font-medium">{order.id}</td>
                        <td className="px-4 py-3">{order.customer}</td>
                        <td className="px-4 py-3 text-gray-500">{order.date}</td>
                        <td className="px-4 py-3 text-right font-medium">${order.total.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                            order.status === 'Delivered' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Latest Products</TabsTrigger>
              <TabsTrigger value="blogPosts">Latest Blog Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {productsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-10 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left">Product</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-right">Price</th>
                            <th className="px-4 py-3 text-center">Stock</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {products?.slice(0, 5).map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <img 
                                    src={`${product.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&q=80`}
                                    alt={product.name}
                                    className="w-8 h-8 rounded object-cover mr-3"
                                  />
                                  <span className="font-medium">{product.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {product.categoryId === 1 ? 'Garden Tools' :
                                 product.categoryId === 2 ? 'Indoor Plants' :
                                 product.categoryId === 3 ? 'Vegetable Seeds' :
                                 product.categoryId === 4 ? 'Planters & Pots' :
                                 'Other'}
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                ${(product.salePrice || product.price).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                                  product.inStock 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <a href={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-800 mr-2">
                                  <i className="fas fa-edit"></i>
                                </a>
                                <button className="text-red-600 hover:text-red-800">
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="blogPosts" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {blogPostsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-10 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">Author</th>
                            <th className="px-4 py-3 text-left">Published</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {blogPosts?.slice(0, 5).map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <img 
                                    src={`${post.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&q=80`}
                                    alt={post.title}
                                    className="w-8 h-8 rounded object-cover mr-3"
                                  />
                                  <span className="font-medium">{post.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {post.category}
                              </td>
                              <td className="px-4 py-3">
                                {post.authorName}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {new Date(post.publishDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <a href={`/admin/blog-posts/edit/${post.id}`} className="text-blue-600 hover:text-blue-800 mr-2">
                                  <i className="fas fa-edit"></i>
                                </a>
                                <button className="text-red-600 hover:text-red-800">
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
