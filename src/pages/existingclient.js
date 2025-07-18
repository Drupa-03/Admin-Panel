//Working Code--[ 27/06/25 12:32PM]--------------------------------------------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, ArrowRight, Trash2, Edit3 } from "lucide-react";
import api from "@/utills/api";
import { toast } from "react-toastify";
import usePermission from "./hooks/usePermission";
import ErrorPage from "./_error1";

export default function ClientsPage() {
  const { is_view, is_add, is_update, is_delete } =
    usePermission("manage_customers");
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expiringClients, setExpiringClients] = useState([]);
  const [clientToDelete, setClientToDelete] = useState(null);
  // ✅ Ref to track shown toasts (persists across re-renders)
  const shownToastSet = useRef(new Set());
  // ✅ Ref to track the last check time to avoid duplicate toasts
  const lastToastCheck = useRef(Date.now());
  const [exportLoading, setExportLoading] = useState(false);

  // ✅ Fetch client data on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get("/nodesetup/customers");
        const data = response.data?.data || [];
        setClients(data);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };
    fetchClients();
  }, []);

  // ✅ Check for expiring clients and show reminders
  useEffect(() => {
    if (clients.length === 0) return;

    const today = new Date();
    const expiring = [];
    const currentTime = Date.now();
    // Only show toasts if it's been more than 30 seconds since last check
    // This prevents duplicate toasts during rapid re-renders
    const shouldShowToasts = currentTime - lastToastCheck.current > 30000;

    clients.forEach((client) => {
      const endDate = new Date(client.plan_end_date);
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

      // ✅ Show reminder for clients with 2 days or fewer remaining (but not expired)
      if (daysLeft <= 2 && daysLeft > 0) {
        expiring.push(client);

        // Create unique toast key based on client ID and current date
        const dateKey = today.toDateString();
        const toastKey = `${client.id}-${dateKey}-d${daysLeft}`;

        // Show toast only if we haven't shown it today and enough time has passed
        if (shouldShowToasts && !shownToastSet.current.has(toastKey)) {
          // Clear old toast keys for this client
          Array.from(shownToastSet.current).forEach((key) => {
            if (key.startsWith(`${client.id}-`) && key !== toastKey) {
              shownToastSet.current.delete(key);
            }
          });

          shownToastSet.current.add(toastKey);

          const message =
            daysLeft === 1
              ? `⚠️ ${client.company_name}'s plan expires tomorrow!`
              : `⚠️ ${client.company_name}'s plan expires in ${daysLeft} days!`;

          const bgColor =
            daysLeft === 1
              ? "bg-gradient-to-r from-red-600 to-red-700"
              : "bg-gradient-to-r from-orange-500 to-red-500";

          toast.warn(message, {
            toastId: toastKey,
            position: "top-right",
            autoClose: daysLeft === 1 ? 8000 : 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: `${bgColor} text-white font-semibold`,
          });
        }
      }
    });

    if (shouldShowToasts) {
      lastToastCheck.current = currentTime;
    }
    setExpiringClients(expiring);
  }, [clients]);

  // ✅ Helper function to check if client is expiring soon
  const isClientExpiringSoon = (client) => {
    const today = new Date();
    const endDate = new Date(client.plan_end_date);
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft <= 60 && daysLeft > 0;
  };

  // ✅ Helper function to get days left
  const getDaysLeft = (client) => {
    const today = new Date();
    const endDate = new Date(client.plan_end_date);
    return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  };

  const deleteClient = async (id) => {
    try {
      await api.delete(`/nodesetup/customers/${id}`);
      setClients((prev) => prev.filter((client) => client.id !== id));
      // Clean up toast references for deleted client
      Array.from(shownToastSet.current).forEach((key) => {
        if (key.startsWith(`${id}-`)) {
          shownToastSet.current.delete(key);
        }
      });

      toast.success("Client deleted successfully!");
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Error deleting client. Please try again. 🤔");
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.mobile_number_1?.includes(searchQuery) ||
      client.mobile_number_2?.includes(searchQuery)
  );

  const handleExportCustomers = async (sendEmail = false) => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      const response = await api.get(
        `/nodesetup/customers/export${sendEmail ? "?sendEmail=true" : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customers.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (sendEmail) {
        toast.success("Customer file downloaded and emailed to admin!");
      } else {
        toast.success("Customer file downloaded.");
      }
    } catch (err) {
      console.error("Customer export error:", err);
      toast.error("Failed to export customers.");
    } finally {
      setExportLoading(false);
    }
  };

  if (is_view === 0) {
    return <ErrorPage />;
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-72 pt-12 px-4 sm:px-6 md:px-8'>
      <div className='max-w-7xl mx-auto py-10'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <div className='flex items-center'>
            <User className='text-[#004b8f] size-8' />
            <h1 className='text-3xl font-bold text-[#004b8f] dark:text-white ml-2'>
              Existing Client/Institute
            </h1>
          </div>
          {is_add === 1 && (
            <>
              <button
                onClick={() => router.push("/Add-client")}
                className='flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer'>
                <span className='font-semibold'>Add Client</span>
                <ArrowRight
                  size={18}
                  className='transition-transform duration-300 group-hover:translate-x-1'
                />
              </button>

            </>
          )}
        </div>

        {/* Search */}
        <div className='flex justify-between bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-6 mb-6'>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={18}
            />
            <input
              type='text'
              placeholder='Search clients...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f] transition-all duration-200'
            />
          </div>
          <div className="flex gap-2" >
            
              <button
                onClick={() => handleExportCustomers(false)}
                disabled={exportLoading}
                className='flex items-center gap-2 px-6 py-2 border border-[#004b8f] text-[#004b8f]  rounded-xl  disabled:opacity-50 transition cursor-pointer dark:text-white'>
                {exportLoading ? "Downloading..." : "Download"}
              </button>

              <button
                onClick={() => handleExportCustomers(true)}
                disabled={exportLoading}
                className='flex items-center gap-2 px-6 py-2 border border-[#004b8f] text-[#004b8f]  rounded-xl  disabled:opacity-50 transition cursor-pointer dark:text-white'>
                {exportLoading ? "Processing..." : "Send Email & Download"}
              </button>
          </div>
        </div>

        {/* Table */}
        {filteredClients.length === 0 ? (
          <div className='text-center py-12'>
            <User className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-gray-100'>
              No clients found
            </h3>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              {searchQuery
                ? "Try adjusting your search terms."
                : "Get started by adding a new client."}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm'>
              <thead className='bg-[#004b8f] text-white'>
                <tr>
                  <th className='px-4 py-5 text-left font-semibold'>Name</th>
                  <th className='px-4 py-5 text-left font-semibold'>Address</th>
                  <th className='px-4 py-5 text-left font-semibold'>Country</th>
                  <th className='px-4 py-5 text-left font-semibold'>State</th>
                  <th className='px-4 py-5 text-left font-semibold'>City</th>
                  <th className='px-4 py-5 text-left font-semibold'>Email</th>
                  <th className='px-4 py-5 text-left font-semibold'>
                    Mobile No1
                  </th>
                  <th className='px-4 py-5 text-left font-semibold'>
                    Mobile No2
                  </th>
                  <th className='px-4 py-5 text-left font-semibold'>Plan</th>
                  <th className='px-4 py-5 text-left font-semibold'>
                    Start Date
                  </th>
                  <th className='px-4 py-5 text-left font-semibold'>
                    End Date
                  </th>
                  <th className='px-4 py-5 text-center font-semibold'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100'>
                {filteredClients.map((client, idx) => {
                  const daysLeft = getDaysLeft(client);
                  const isExpiringSoon = isClientExpiringSoon(client);
                  const isExpiredOrExpiring = daysLeft <= 0;

                  return (
                    <tr
                      key={client.id}
                      className={`transition-all duration-300
                        ${
                          isExpiredOrExpiring
                            ? "bg-gradient-to-r from-red-100 to-red-50 dark:from-red-700/10 dark:to-red-800/20 border-l-4 border-red-600"
                            : isExpiringSoon
                            ? "bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-700/10 dark:to-yellow-900/20 border-l-4 border-orange-500"
                            : idx % 2 === 0
                            ? "bg-white text-black dark:bg-gray-900 dark:text-white"
                            : "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                        }
                        
                      `}>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          {(isExpiringSoon || isExpiredOrExpiring) && (
                            <div
                              className={`w-2 h-2 rounded-full animate-pulse ${
                                isExpiredOrExpiring
                                  ? "bg-red-600"
                                  : "bg-orange-500"
                              }`}></div>
                          )}
                          <span
                            className={
                              isExpiredOrExpiring
                                ? "font-semibold text-red-800 dark:text-red-400"
                                : isExpiringSoon
                                ? "font-semibold text-orange-700 dark:text-orange-400"
                                : ""
                            }>
                            {client.company_name}
                          </span>
                        </div>
                      </td>
                      <td className='px-4 py-3'>{client.address}</td>
                      <td className='px-4 py-3'>{client.country}</td>
                      <td className='px-4 py-3'>{client.state}</td>
                      <td className='px-4 py-3'>{client.city}</td>
                      <td className='px-4 py-3'>{client.email}</td>
                      <td className='px-4 py-3'>{client.mobile_number_1}</td>
                      <td className='px-4 py-3'>{client.mobile_number_2}</td>
                      <td className='px-4 py-3'>{client.plan_purchased}</td>
                      <td className='px-4 py-3'>
                        {new Date(client.plan_start_date).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <span
                            className={
                              isExpiredOrExpiring
                                ? "font-semibold text-red-800 dark:text-red-400"
                                : isExpiringSoon
                                ? "font-semibold text-orange-700 dark:text-orange-400"
                                : ""
                            }>
                            {new Date(client.plan_end_date).toLocaleDateString(
                              "en-GB"
                            )}
                          </span>
                          {isExpiredOrExpiring && (
                            <span className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium'>
                              EXPIRED
                            </span>
                          )}
                          {isExpiringSoon && !isExpiredOrExpiring && (
                            <span className='text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium'>
                              {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2 justify-center'>
                          {is_update === 1 && (
                            <button
                              onClick={() =>
                                router.push(`/Add-client?id=${client.id}`)
                              }
                              className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer'
                              title='Edit Client'>
                              <Edit3 size={16} />
                            </button>
                          )}
                          {is_delete === 1 && (
                            <button
                              onClick={() => setClientToDelete(client.id)}
                              className='p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer'
                              title='Delete Client'>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {clientToDelete && (
          <div className='fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50'>
            <div className='bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm'>
              <h2 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
                Confirm Deletion
              </h2>
              <p className='mb-4 text-gray-700 dark:text-gray-300'>
                Are you sure you want to delete this client?
              </p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setClientToDelete(null)}
                  className='px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'>
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteClient(clientToDelete);
                    setClientToDelete(null);
                  }}
                  className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer duration-300'>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
