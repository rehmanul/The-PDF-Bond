import AdminLayout from "@/components/admin/AdminLayout";
import OrderList from "@/components/admin/OrderList";

export default function AdminOrdersPage() {
  return (
    <AdminLayout title="Orders">
      <OrderList />
    </AdminLayout>
  );
}
