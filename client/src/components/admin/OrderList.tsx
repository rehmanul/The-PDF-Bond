import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet';
import { 
  Eye, 
  MoreHorizontal, 
  Search,
  PackageCheck,
  Truck,
  Ban,
  CheckCircle
} from 'lucide-react';
import { formatPrice, formatShortDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function OrderList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch orders
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });
  
  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest('PATCH', `/api/orders/${id}/status`, { status });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order status');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "The order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter orders by search term
  const filteredOrders = orders?.filter(order => 
    order.id.toString().includes(searchTerm) ||
    order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // View order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };
  
  // Update order status
  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'processing':
        return <Badge variant="secondary"><PackageCheck className="h-3 w-3 mr-1" /> Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500"><Truck className="h-3 w-3 mr-1" /> Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Orders</h2>
        </div>
        <div className="w-full h-12 bg-gray-100 animate-pulse rounded-md mb-4" />
        <div className="w-full h-64 bg-gray-100 animate-pulse rounded-md" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading orders. Please try again later.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/orders'] })} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders</h2>
      </div>
      
      {/* Search */}
      <div className="relative w-full md:w-1/3 mb-4">
        <Input
          type="text"
          placeholder="Search orders by ID or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {/* Orders table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders && filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{formatShortDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">
                      {order.shippingAddress}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={order.status === 'pending'} onClick={() => handleStatusChange(order.id, 'pending')}>
                          Set as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={order.status === 'processing'} onClick={() => handleStatusChange(order.id, 'processing')}>
                          Set as Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={order.status === 'shipped'} onClick={() => handleStatusChange(order.id, 'shipped')}>
                          Set as Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={order.status === 'delivered'} onClick={() => handleStatusChange(order.id, 'delivered')}>
                          Set as Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={order.status === 'cancelled'} onClick={() => handleStatusChange(order.id, 'cancelled')}>
                          Set as Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {searchTerm ? "No orders match your search." : "No orders available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Order detail sheet */}
      <Sheet open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order #{selectedOrder?.id}</SheetTitle>
            <SheetDescription>
              {formatShortDate(selectedOrder?.createdAt || '')}
            </SheetDescription>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedOrder.status)}
                  
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                <p className="text-sm">
                  <strong>Shipping Address:</strong> {selectedOrder.shippingAddress}
                </p>
                <p className="text-sm mt-1">
                  <strong>Billing Address:</strong> {selectedOrder.billingAddress}
                </p>
                <p className="text-sm mt-1">
                  <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Order items would be fetched and displayed here */}
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          <Button 
                            variant="outline" 
                            className="text-sm" 
                            size="sm"
                            onClick={() => {
                              // Fetch order items
                              toast({
                                title: "Order Items",
                                description: "Order items would be fetched and displayed here in a real implementation.",
                              });
                            }}
                          >
                            Load Order Items
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.total * 0.9)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(selectedOrder.total * 0.1)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <SheetClose asChild>
                  <Button variant="outline">Close</Button>
                </SheetClose>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
