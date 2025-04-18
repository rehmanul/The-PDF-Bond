import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Product, Order, BlogPost } from "@shared/schema";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { formatPrice, formatShortDate } from "@/utils/formatters";
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle
} from "lucide-react";

export default function AdminDashboardPage() {
  // Fetch recent orders
  const { data: orders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    select: (data) => data.slice(0, 5),
  });
  
  // Fetch products for stats
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Fetch blog posts for stats
  const { data: posts } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });
  
  // Count stats
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalPosts = posts?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  
  // Sample sales data (would come from API in a real app)
  const salesData = [
    { name: 'Jan', total: 2300 },
    { name: 'Feb', total: 3100 },
    { name: 'Mar', total: 4200 },
    { name: 'Apr', total: 3800 },
    { name: 'May', total: 4300 },
    { name: 'Jun', total: 5100 },
    { name: 'Jul', total: 4800 },
  ];
  
  // Sample product category data (would come from API in a real app)
  const productCategoryData = [
    { name: 'Vegetables', count: 45 },
    { name: 'Herbs', count: 35 },
    { name: 'Indoor Plants', count: 28 },
    { name: 'Tools', count: 22 },
    { name: 'Pots & Planters', count: 18 },
    { name: 'Seeds', count: 15 },
  ];
  
  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">+5 added this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">+8 from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPosts}</div>
              <p className="text-xs text-muted-foreground">+2 published this month</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <XAxis dataKey="name" stroke="#888888" />
                    <YAxis
                      stroke="#888888"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
                <CardDescription>Distribution of products across categories</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productCategoryData}>
                    <XAxis dataKey="name" stroke="#888888" />
                    <YAxis stroke="#888888" />
                    <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from your store</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {orders ? (
                    orders.map(order => {
                      let statusIcon;
                      
                      switch(order.status) {
                        case 'delivered':
                          statusIcon = <CheckCircle className="h-4 w-4 text-green-500" />;
                          break;
                        case 'shipped':
                          statusIcon = <Truck className="h-4 w-4 text-blue-500" />;
                          break;
                        case 'pending':
                          statusIcon = <Clock className="h-4 w-4 text-yellow-500" />;
                          break;
                        case 'cancelled':
                          statusIcon = <AlertCircle className="h-4 w-4 text-red-500" />;
                          break;
                        default:
                          statusIcon = <Clock className="h-4 w-4 text-gray-500" />;
                      }
                      
                      return (
                        <div key={order.id} className="flex items-center">
                          <Avatar className="h-9 w-9 mr-3">
                            <AvatarImage src={`https://avatar.vercel.sh/${order.id}.png`} alt={`Order #${order.id}`} />
                            <AvatarFallback>O{order.id}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Order #{order.id}</span>
                              {statusIcon}
                              <span className="text-xs text-muted-foreground capitalize">{order.status}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">{formatShortDate(order.createdAt)}</div>
                          </div>
                          <div className="font-medium">{formatPrice(order.total)}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No recent orders to display
                    </div>
                  )}
                </div>
                
                <div className="mt-8 text-center">
                  <Link href="/admin/orders">
                    <Button variant="outline" className="gap-1">
                      View all orders <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/products/new">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Add Product</CardTitle>
                <Package className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Create a new product listing</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/blog/new">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">New Blog Post</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Publish a new blog article</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/orders">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Manage Orders</CardTitle>
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">View and update customer orders</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/customers">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Customer List</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">View customer information</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
