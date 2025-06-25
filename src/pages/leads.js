// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Search,
//   Plus,
//   Trash2,
//   Pencil,
//   Filter,
//   Users,
//   Send,
//   X,
//   ArrowRight,
// } from "lucide-react";
// import api from "@/utills/api";
// import usePermission from "./hooks/usePermission";
// import { toast } from "react-toastify";

// export default function Leads() {
//   const router = useRouter();
//   const { is_view, is_add, is_update, is_delete } =
//     usePermission("manage_leads");

//   const [leads, setLeads] = useState([]);
//   const [selectedLeads, setSelectedLeads] = useState([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedFollowUpNumber, setSelectedFollowUpNumber] = useState("");
//   const [selectedFollowUpId, setSelectedFollowUpId] = useState("");
//   const [selectAll, setSelectAll] = useState(false);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isSending, setIsSending] = useState(false);
//   const [sendMethod, setSendMethod] = useState("email");
//   const [followUpError, setFollowUpError] = useState("");
//   const [followUps, setFollowUps] = useState([]);
//   const [leadToDelete, setLeadToDelete] = useState(null);

//   const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);
//   const [sendDate, setSendDate] = useState(
//     () => new Date().toISOString().split("T")[0]
//   );
//   const [sendTime, setSendTime] = useState(() =>
//     new Date().toTimeString().slice(0, 5)
//   );
//   const [followUpResponse, setFollowUpResponse] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [selectedLeadmsg, setSelectedLeadmsg] = useState(null);

//   const handleViewClick = (lead) => {
//     setSelectedLeadmsg(lead);
//   };

//   const closeModal = () => {
//     setSelectedLeadmsg(null);
//   };
//   const [selectedLeadres, setSelectedLeadres] = useState(null);

//   const handleViewresClick = (lead) => {
//     setSelectedLeadres(lead);
//   };

//   const closeresModal = () => {
//     setSelectedLeadres(null);
//   };

//   useEffect(() => {
//     fetchLeads();
//   }, []);

//   const fetchLeads = async () => {
//     try {
//       const response = await api.get("/nodesetup/leads");
//       const data = Array.isArray(response.data.data) ? response.data.data : [];
//       setLeads(data);
//     } catch (error) {
//       console.error("Failed to fetch leads", error);
//       setLeads([]);
//     }
//   };

//   const fetchFollowUps = async () => {
//     setIsLoadingFollowUps(true);
//     try {
//       const response = await api.get("/nodesetup/followups");
//       let data = Array.isArray(response.data)
//         ? response.data
//         : Array.isArray(response.data.data)
//         ? response.data.data
//         : [];
//       setFollowUps(data);
//       setFollowUpError("");
//     } catch (error) {
//       console.error("Failed to fetch follow-ups", error);
//       setFollowUps([]);
//       setFollowUpError("Failed to load follow-ups. Please try again.");
//     } finally {
//       setIsLoadingFollowUps(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await api.delete(`/nodesetup/leads/${id}`);
//       setLeads((prev) => prev.filter((lead) => lead.id !== id));
//       setSelectedLeads((prev) => prev.filter((leadId) => leadId !== id));
//     } catch (error) {
//       console.error("Error deleting lead:", error);
//     }
//   };

//   const handleUpdate = (id) => router.push(`/Add-lead?id=${id}`);

//   const handleSelectLead = (id) => {
//     setSelectedLeads((prev) =>
//       prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedLeads([]);
//     } else {
//       const allIds = filteredLeads.map((lead) => lead.id);
//       setSelectedLeads(allIds);
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleDialogOpen = async () => {
//     await fetchFollowUps();
//     setDialogOpen(true);
//     setSelectedFollowUpNumber("");
//     setSelectedFollowUpId("");
//     setSendDate(new Date().toISOString().split("T")[0]);
//     setSendTime(new Date().toTimeString().slice(0, 5));
//     setFollowUpResponse("");
//     setErrorMessage("");
//   };

//   const handleFollowUpSelect = (id) => {
//     setSelectedFollowUpId(id);
//     const selected = followUps.find((item) => String(item.id) === String(id));
//     setSelectedFollowUpNumber(selected ? selected.follow_up_number : "");
//     setFollowUpError("");
//   };

//   const sendFollowUps = async () => {
//     if (!selectedFollowUpId) {
//       setErrorMessage("Please select a follow-up number.");
//       return;
//     }
//     if (!sendMethod) {
//       setErrorMessage("Please select a send method.");
//       return;
//     }
//     if (!sendDate || !sendTime) {
//       setErrorMessage("Please provide send date and time.");
//       return;
//     }
//     const alreadySentToSome = selectedLeads.some((leadId) => {
//       const lead = leads.find((l) => l.id === leadId);
//       const sentFollowUps = String(lead?.sent_follow_up_numbers || "")
//         .split(",")
//         .map((n) => n.trim())
//         .filter((n) => n !== "");
//       return sentFollowUps.includes(String(selectedFollowUpNumber));
//     });
//     if (alreadySentToSome) {
//       setErrorMessage(
//         `Some selected leads have already received Follow-Up ${selectedFollowUpNumber}.`
//       );
//       return;
//     }
//     setIsSending(true);
//     setErrorMessage("");
//     try {
//       const requests = selectedLeads.map(async (leadId) => {
//         const payload = {
//           method: sendMethod,
//           send_date: sendDate,
//           send_time: sendTime,
//           response: followUpResponse,
//         };
//         return api.post(
//           `/nodesetup/leads/${leadId}/follow-ups/${selectedFollowUpId}/send`,
//           payload,
//           {
//             headers: { "Content-Type": "application/json" },
//             timeout: 30000,
//           }
//         );
//       });
//       await Promise.all(requests);
//       toast.success("Follow-ups sent successfully!");
//       setDialogOpen(false);
//       setSelectedLeads([]);
//       setSelectAll(false);
//       fetchLeads();
//       setFollowUpResponse("");
//     } catch (error) {
//       console.error("Error sending follow-ups:", error);
//       let errorMsg = "Failed to send follow-ups";
//       if (error.response?.data?.message) {
//         errorMsg = error.response.data.message;
//         if (error.response.data.data) {
//           errorMsg += `: ${error.response.data.data}`;
//         }
//       } else if (error.message) {
//         errorMsg += `: ${error.message}`;
//       }
//       setErrorMessage(errorMsg);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const filteredLeads = leads.filter((lead) => {
//     const matchesSearch = Object.values(lead)
//       .join(" ")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       statusFilter === "All" || lead.lead_status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   if (!is_view) {
//     return (
//       <div className="p-6 text-red-600 text-center">
//         You do not have permission to view leads.
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8">
//       <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//         <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
//           <div className="flex items-center gap-2">
//             <Users className="text-[#004b8f] size-8" />
//             <h1 className="text-3xl font-bold text-[#004b8f] dark:text-white">
//               Leads List
//             </h1>
//           </div>
//           <div className="flex flex-wrap justify-end gap-2">
//             {is_add === 1 && (
//               <button
//                 onClick={() => router.push("/Add-lead")}
//                 className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer"
//               >
//                 <span className="font-semibold">Add Lead</span>
//                 <ArrowRight
//                   size={18}
//                   className="transition-transform duration-300 group-hover:translate-x-1"
//                 />
//               </button>
//             )}
//             <button
//               onClick={handleDialogOpen}
//               disabled={selectedLeads.length === 0}
//               className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
//             >
//               <span className="ml-2">Send Followup</span>
//               <Send
//                 size={18}
//                 className="transition-transform duration-300 group-hover:translate-x-1"
//               />
//             </button>
//           </div>
//         </div>

//         <div className="bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-6 mb-6">
//           <div className="flex flex-wrap gap-4 items-center">
//             <div className="relative">
//               <Search
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 size={18}
//               />
//               <input
//                 type="text"
//                 placeholder="Search leads..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <Filter size={18} className="text-gray-500" />
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="p-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
//               >
//                 <option value="All">Select</option>
//                 <option value="New">New</option>
//                 <option value="Contacted">Contacted</option>
//                 <option value="Qualified">Qualified</option>
//                 <option value="Lost">Lost</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Table will be shown only if is_view is true */}
//         {leads.length === 0 ? (
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
//             <Users className="mx-auto text-gray-400 size-16 mb-4" />
//             <p className="text-gray-600 dark:text-gray-300 text-lg">
//               No leads found.
//             </p>
//             {is_add === 1 && (
//               <button
//                 onClick={() => router.push("/Add-lead")}
//                 className="mt-4 px-6 py-2 bg-[#004b8f] text-white rounded-lg hover:bg-[#003d73] transition-colors"
//               >
//                 Add Your First Lead
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
//               <thead className="bg-[#004b8f] text-white">
//                 <tr>
//                   <th className="px-4 py-3 text-left">
//                     <input
//                       type="checkbox"
//                       checked={selectAll}
//                       onChange={handleSelectAll}
//                       className="rounded border-gray-300 text-[#004b8f] focus:ring-[#004b8f]"
//                     />
//                   </th>
//                   <th className="px-4 py-3 text-left font-medium">
//                     Customer Name
//                   </th>
//                   <th className="px-4 py-3 text-left font-medium">
//                     Company Name
//                   </th>
//                   <th className="px-4 py-3 text-left font-medium">Email</th>
//                   <th className="px-4 py-3 text-left font-medium">Mobile1</th>
//                   <th className="px-4 py-3 text-left font-medium">Mobile2</th>
//                   <th className="px-4 py-3 text-left font-medium">Country</th>
//                   <th className="px-4 py-3 text-left font-medium">State</th>
//                   <th className="px-4 py-3 text-left font-medium">City</th>
//                   <th className="px-4 py-3 text-left font-medium">Interest</th>
//                   <th className="px-4 py-3 text-left font-medium">Notes</th>
//                   <th className="px-4 py-3 text-left font-medium">Response</th>
//                   <th className="px-4 py-3 text-left font-medium">Status</th>
//                   <th className="px-4 py-3 text-left font-medium">
//                     FollowUp No
//                   </th>
//                   <th className="px-4 py-3 text-left font-medium">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100">
//                 {filteredLeads.map((lead, idx) => (
//                   <tr
//                     key={lead.id}
//                     className={
//                       idx % 2 === 0
//                         ? "bg-white text-black dark:bg-gray-900 dark:text-white"
//                         : "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
//                     }
//                   >
//                     <td className="px-4 py-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedLeads.includes(lead.id)}
//                         onChange={() => handleSelectLead(lead.id)}
//                         className="rounded border-gray-300 text-[#004b8f] focus:ring-[#004b8f]"
//                       />
//                     </td>
//                     <td className="px-4 py-3 font-medium">
//                       {lead.customer_name}
//                     </td>
//                     <td className="px-4 py-3">{lead.company_name}</td>
//                     <td className="px-4 py-3">{lead.email}</td>
//                     <td className="px-4 py-3">{lead.mobile_number_1}</td>
//                     <td className="px-4 py-3">{lead.mobile_number_2}</td>
//                     <td className="px-4 py-3">{lead.country}</td>
//                     <td className="px-4 py-3">{lead.state}</td>
//                     <td className="px-4 py-3">{lead.city}</td>
//                     <td className="px-4 py-3">{lead.interested_product}</td>

//                     <td className="px-4 py-3">
//                       <button
//                         onClick={() => handleViewClick(lead)}
//                         className="text-blue-700 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 cursor-pointer"
//                       >
//                         View
//                       </button>
//                     </td>
//                     <td className="px-4 py-3">
//                       <button
//                         onClick={() => handleViewresClick(lead)}
//                         className="text-blue-700 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 cursor-pointer"
//                       >
//                         View
//                       </button>
//                     </td>

//                     <td className="px-4 py-3">
//                       <span
//                         className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
//                           lead.lead_status === "New"
//                             ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
//                             : lead.lead_status === "Contacted"
//                             ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
//                             : lead.lead_status === "Qualified"
//                             ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
//                             : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
//                         }`}
//                       >
//                         {lead.lead_status}
//                       </span>
//                     </td>

// <td className="px-4 py-3 align-top">
//   <div className="flex flex-wrap gap-1 max-w-xs">
//     {String(lead.sent_follow_up_numbers || "")
//       .split(",")
//       .filter((val) => val.trim() !== "")
//       .slice(0, 2)
//       .map((num, index) => (
//         <span
//           key={index}
//           className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
//         >
//           {num.trim()}
//         </span>
//       ))}

//     {/* Show "+N more" badge if there are more numbers */}
//     {String(lead.sent_follow_up_numbers || "")
//       .split(",")
//       .filter((val) => val.trim() !== "")
//       .length > 2 && (
//       <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
//         +
//         {String(lead.sent_follow_up_numbers || "")
//           .split(",")
//           .filter((val) => val.trim() !== "").length - 2}{" "}
//         more
//       </span>
//     )}
//   </div>
// </td>

//                     <td className="px-4 py-3">
//                       <div className="flex gap-2">
//                         {is_update === 1 && (
//                           <button
//                             onClick={() => handleUpdate(lead.id)}
//                             className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors cursor-pointer"
//                             title="Edit"
//                           >
//                             <Pencil size={16} />
//                           </button>
//                         )}
//                         {is_delete === 1 && (
//                           <button
//                             onClick={() => setLeadToDelete(lead.id)}
//                             className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors cursor-pointer"
//                             title="Delete"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//         {dialogOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-xl font-bold text-gray-800 dark:text-white">
//                     Send Follow Up
//                   </h2>
//                   <button
//                     onClick={() => setDialogOpen(false)}
//                     className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>
//               </div>
//               <div className="p-6 space-y-6">
//                 {errorMessage && (
//                   <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
//                     {errorMessage}
//                   </div>
//                 )}
//                 <div>
//                   <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Selected Leads ({selectedLeads.length})
//                   </label>
//                   <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
//                     {selectedLeads.map((leadId) => {
//                       const lead = leads.find((l) => l.id === leadId);
//                       const sentFollowUps = String(
//                         lead?.sent_follow_up_numbers || ""
//                       )
//                         .split(",")
//                         .filter((val) => val.trim() !== "");
//                       return (
//                         <div
//                           key={leadId}
//                           className="py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
//                         >
//                           <div className="font-medium text-gray-800 dark:text-white">
//                             {lead
//                               ? `${lead.customer_name} (${lead.email})`
//                               : `Lead ID: ${leadId}`}
//                           </div>
//                           {sentFollowUps.length > 0 && (
//                             <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                               Already sent: {sentFollowUps.join(", ")}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Select Follow-Up Number
//                   </label>
//                   {isLoadingFollowUps ? (
//                     <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                       Loading follow-ups...
//                     </div>
//                   ) : followUps.length === 0 ? (
//                     <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
//                       No follow-ups available. Please create follow-up templates
//                       first.
//                     </div>
//                   ) : (
//                     <>
//                       <select
//                         value={selectedFollowUpId}
//                         onChange={(e) => handleFollowUpSelect(e.target.value)}
//                         className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f] ${
//                           followUpError
//                             ? "border-red-500"
//                             : "border-gray-300 dark:border-gray-600"
//                         }`}
//                       >
//                         <option value="">-- Select Follow-Up --</option>
//                         {followUps.map((item) => {
//                           const isAlreadySent = selectedLeads.some((leadId) => {
//                             const lead = leads.find((l) => l.id === leadId);
//                             const sentFollowUps = String(
//                               lead?.sent_follow_up_numbers || ""
//                             )
//                               .split(",")
//                               .map((n) => n.trim())
//                               .filter((n) => n !== "");
//                             return sentFollowUps.includes(
//                               String(item.follow_up_number)
//                             );
//                           });
//                           return (
//                             <option
//                               key={item.id}
//                               value={item.id}
//                               className={isAlreadySent ? "text-red-500" : ""}
//                             >
//                               Follow-Up {item.follow_up_number}
//                               {isAlreadySent ? " (Already sent to some)" : ""}
//                             </option>
//                           );
//                         })}
//                       </select>
//                       {followUpError && (
//                         <p className="text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
//                           {followUpError}
//                         </p>
//                       )}
//                     </>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Send Method
//                   </label>
//                   <select
//                     value={sendMethod}
//                     onChange={(e) => setSendMethod(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
//                   >
//                     <option value="email">Email</option>
//                     <option value="whatsapp">WhatsApp</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Send Date
//                   </label>
//                   <input
//                     type="date"
//                     value={sendDate}
//                     onChange={(e) => setSendDate(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Send Time
//                   </label>
//                   <input
//                     type="time"
//                     value={sendTime}
//                     onChange={(e) => setSendTime(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Response (Optional)
//                   </label>
//                   <textarea
//                     rows={3}
//                     value={followUpResponse}
//                     onChange={(e) => setFollowUpResponse(e.target.value)}
//                     placeholder="Enter any response/remark..."
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
//                   />
//                 </div>
//               </div>

//               <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
//                 <div className="flex justify-end gap-3">
//                   <button
//                     onClick={() => setDialogOpen(false)}
//                     className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     {" "}
//                     Cancel
//                   </button>
//                   <button
//                     onClick={sendFollowUps}
//                     disabled={
//                       !selectedFollowUpId ||
//                       !sendMethod ||
//                       !sendDate ||
//                       !sendTime ||
//                       isSending
//                     }
//                     className="flex items-center px-6 py-2 bg-[#004b8f] text-white rounded-lg hover:bg-[#003d73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     {isSending ? (
//                       <>
//                         <svg
//                           className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                         >
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                           ></circle>
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           ></path>
//                         </svg>
//                         Sending...
//                       </>
//                     ) : (
//                       <>
//                         <Send size={16} className="mr-2" />
//                         Send Follow-Up
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {selectedLeadmsg && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md w-full shadow-lg">
//               <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
//                 Lead Details
//               </h2>
//               <p className="mb-2 text-gray-800 dark:text-gray-300">
//                 <strong className="text-gray-900 dark:text-gray-100">
//                   Message:
//                 </strong>{" "}
//                 {selectedLeadmsg.notes || "N/A"}
//               </p>
//               <button
//                 onClick={closeModal}
//                 className="bg-blue-500 text-white px-3 py-1  rounded hover:bg-blue-600 items-center"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}

//         {selectedLeadres && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md w-full shadow-lg">
//               <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
//                 Lead Details
//               </h2>
//               <p className="mb-4 text-gray-800 dark:text-gray-300">
//                 <strong className="text-gray-900 dark:text-gray-100">
//                   Response:
//                 </strong>{" "}
//                 {selectedLeadres.response || "N/A"}
//               </p>
//               <button
//                 onClick={closeresModal}
//                 className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}

//         {leadToDelete && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
//               <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
//                 Confirm Deletion
//               </h2>
//               <p className="mb-4 text-gray-700 dark:text-gray-300">
//                 Are you sure you want to delete this lead?
//               </p>
//               <div className="flex justify-end gap-3">
//                 <button
//                   onClick={() => setLeadToDelete(null)}
//                   className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => {
//                     handleDelete(leadToDelete);
//                     setLeadToDelete(null);
//                   }}
//                   className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer duration-300"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Filter,
  Users,
  Send,
  X,
  ArrowRight,
} from "lucide-react";
import api from "@/utills/api";
import usePermission from "./hooks/usePermission";
import { toast } from "react-toastify";

export default function Leads() {
  const router = useRouter();
  const { is_view, is_add, is_update, is_delete } =
    usePermission("manage_leads");

  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFollowUpNumber, setSelectedFollowUpNumber] = useState("");
  const [selectedFollowUpId, setSelectedFollowUpId] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendMethod, setSendMethod] = useState("email");
  const [followUpError, setFollowUpError] = useState("");
  const [followUps, setFollowUps] = useState([]);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [showAllFollowUps, setShowAllFollowUps] = useState(null); // string or null

  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);
  const [sendDate, setSendDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [sendTime, setSendTime] = useState(() =>
    new Date().toTimeString().slice(0, 5)
  );
  const [followUpResponse, setFollowUpResponse] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedLeadmsg, setSelectedLeadmsg] = useState(null);

  const handleViewClick = (lead) => {
    setSelectedLeadmsg(lead);
  };

  const closeModal = () => {
    setSelectedLeadmsg(null);
  };
  const [selectedLeadres, setSelectedLeadres] = useState(null);

  const handleViewresClick = (lead) => {
    setSelectedLeadres(lead);
  };

  const closeresModal = () => {
    setSelectedLeadres(null);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get("/nodesetup/leads");
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setLeads(data);
    } catch (error) {
      console.error("Failed to fetch leads", error);
      setLeads([]);
    }
  };

  const fetchFollowUps = async () => {
    setIsLoadingFollowUps(true);
    try {
      const response = await api.get("/nodesetup/followups");
      let data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setFollowUps(data);
      setFollowUpError("");
    } catch (error) {
      console.error("Failed to fetch follow-ups", error);
      setFollowUps([]);
      setFollowUpError("Failed to load follow-ups. Please try again.");
    } finally {
      setIsLoadingFollowUps(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/nodesetup/leads/${id}`);
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      setSelectedLeads((prev) => prev.filter((leadId) => leadId !== id));
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const handleUpdate = (id) => router.push(`/Add-lead?id=${id}`);

  const handleSelectLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads([]);
    } else {
      const allIds = filteredLeads.map((lead) => lead.id);
      setSelectedLeads(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleDialogOpen = async () => {
    await fetchFollowUps();
    setDialogOpen(true);
    setSelectedFollowUpNumber("");
    setSelectedFollowUpId("");
    setSendDate(new Date().toISOString().split("T")[0]);
    setSendTime(new Date().toTimeString().slice(0, 5));
    setFollowUpResponse("");
    setErrorMessage("");
  };

  const handleFollowUpSelect = (id) => {
    setSelectedFollowUpId(id);
    const selected = followUps.find((item) => String(item.id) === String(id));
    setSelectedFollowUpNumber(selected ? selected.follow_up_number : "");
    setFollowUpError("");
  };

  const sendFollowUps = async () => {
    if (!selectedFollowUpId) {
      setErrorMessage("Please select a follow-up number.");
      return;
    }
    if (!sendMethod) {
      setErrorMessage("Please select a send method.");
      return;
    }
    if (!sendDate || !sendTime) {
      setErrorMessage("Please provide send date and time.");
      return;
    }
    const alreadySentToSome = selectedLeads.some((leadId) => {
      const lead = leads.find((l) => l.id === leadId);
      const sentFollowUps = String(lead?.sent_follow_up_numbers || "")
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n !== "");
      return sentFollowUps.includes(String(selectedFollowUpNumber));
    });
    if (alreadySentToSome) {
      setErrorMessage(
        `Some selected leads have already received Follow-Up ${selectedFollowUpNumber}.`
      );
      return;
    }
    setIsSending(true);
    setErrorMessage("");
    try {
      const requests = selectedLeads.map(async (leadId) => {
        const payload = {
          method: sendMethod,
          send_date: sendDate,
          send_time: sendTime,
          response: followUpResponse,
        };
        return api.post(
          `/nodesetup/leads/${leadId}/follow-ups/${selectedFollowUpId}/send`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
          }
        );
      });
      await Promise.all(requests);
      toast.success("Follow-ups sent successfully!");
      setDialogOpen(false);
      setSelectedLeads([]);
      setSelectAll(false);
      fetchLeads();
      setFollowUpResponse("");
    } catch (error) {
      console.error("Error sending follow-ups:", error);
      let errorMsg = "Failed to send follow-ups";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
        if (error.response.data.data) {
          errorMsg += `: ${error.response.data.data}`;
        }
      } else if (error.message) {
        errorMsg += `: ${error.message}`;
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = Object.values(lead)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || lead.lead_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!is_view) {
    return (
      <div className="p-6 text-red-600 text-center">
        You do not have permission to view leads.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="text-[#004b8f] size-8" />
            <h1 className="text-3xl font-bold text-[#004b8f] dark:text-white">
              Leads List
            </h1>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {is_add === 1 && (
              <button
                onClick={() => router.push("/Add-lead")}
                className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer"
              >
                <span className="font-semibold">Add Lead</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            )}
            <button
              onClick={handleDialogOpen}
              disabled={selectedLeads.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span className="ml-2">Send Followup</span>
              <Send
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
              >
                <option value="All">Select</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table will be shown only if is_view is true */}
        {leads.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <Users className="mx-auto text-gray-400 size-16 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              No leads found.
            </p>
            {is_add === 1 && (
              <button
                onClick={() => router.push("/Add-lead")}
                className="mt-4 px-6 py-2 bg-[#004b8f] text-white rounded-lg hover:bg-[#003d73] transition-colors"
              >
                Add Your First Lead
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-[#004b8f] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#004b8f] focus:ring-[#004b8f]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Customer Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Company Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Mobile1</th>
                  <th className="px-4 py-3 text-left font-medium">Mobile2</th>
                  <th className="px-4 py-3 text-left font-medium">Country</th>
                  <th className="px-4 py-3 text-left font-medium">State</th>
                  <th className="px-4 py-3 text-left font-medium">City</th>
                  <th className="px-4 py-3 text-left font-medium">Interest</th>
                  <th className="px-4 py-3 text-left font-medium">Notes</th>
                  <th className="px-4 py-3 text-left font-medium">Response</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">
                    FollowUp No
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100">
                {filteredLeads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white text-black dark:bg-gray-900 dark:text-white"
                        : "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                    }
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="rounded border-gray-300 text-[#004b8f] focus:ring-[#004b8f]"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {lead.customer_name}
                    </td>
                    <td className="px-4 py-3">{lead.company_name}</td>
                    <td className="px-4 py-3">{lead.email}</td>
                    <td className="px-4 py-3">{lead.mobile_number_1}</td>
                    <td className="px-4 py-3">{lead.mobile_number_2}</td>
                    <td className="px-4 py-3">{lead.country}</td>
                    <td className="px-4 py-3">{lead.state}</td>
                    <td className="px-4 py-3">{lead.city}</td>
                    <td className="px-4 py-3">{lead.interested_product}</td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewClick(lead)}
                        className="text-blue-700 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewresClick(lead)}
                        className="text-blue-700 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 cursor-pointer"
                      >
                        View
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          lead.lead_status === "New"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : lead.lead_status === "Contacted"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : lead.lead_status === "Qualified"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {lead.lead_status}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      {(() => {
                        const allNumbers = String(
                          lead.sent_follow_up_numbers || ""
                        )
                          .split(",")
                          .filter((val) => val.trim() !== "");
                        const visibleNumbers = allNumbers.slice(0, 2);
                        const extraCount =
                          allNumbers.length - visibleNumbers.length;

                        return (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {visibleNumbers.map((num, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              >
                                {num.trim()}
                              </span>
                            ))}

                            {extraCount > 0 && (
                              <button
                                onClick={() => setShowAllFollowUps(allNumbers)}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-100 hover:dark:bg-blue-900 cursor-pointer"
                                title="View all numbers"
                              >
                                +{extraCount} more
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {is_update === 1 && (
                          <button
                            onClick={() => handleUpdate(lead.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {is_delete === 1 && (
                          <button
                            onClick={() => setLeadToDelete(lead.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {dialogOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Send Follow Up
                  </h2>
                  <button
                    onClick={() => setDialogOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {errorMessage && (
                  <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {errorMessage}
                  </div>
                )}
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Leads ({selectedLeads.length})
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                    {selectedLeads.map((leadId) => {
                      const lead = leads.find((l) => l.id === leadId);
                      const sentFollowUps = String(
                        lead?.sent_follow_up_numbers || ""
                      )
                        .split(",")
                        .filter((val) => val.trim() !== "");
                      return (
                        <div
                          key={leadId}
                          className="py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="font-medium text-gray-800 dark:text-white">
                            {lead
                              ? `${lead.customer_name} (${lead.email})`
                              : `Lead ID: ${leadId}`}
                          </div>
                          {sentFollowUps.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Already sent: {sentFollowUps.join(", ")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Follow-Up Number
                  </label>
                  {isLoadingFollowUps ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading follow-ups...
                    </div>
                  ) : followUps.length === 0 ? (
                    <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      No follow-ups available. Please create follow-up templates
                      first.
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedFollowUpId}
                        onChange={(e) => handleFollowUpSelect(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f] ${
                          followUpError
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <option value="">-- Select Follow-Up --</option>
                        {followUps.map((item) => {
                          const isAlreadySent = selectedLeads.some((leadId) => {
                            const lead = leads.find((l) => l.id === leadId);
                            const sentFollowUps = String(
                              lead?.sent_follow_up_numbers || ""
                            )
                              .split(",")
                              .map((n) => n.trim())
                              .filter((n) => n !== "");
                            return sentFollowUps.includes(
                              String(item.follow_up_number)
                            );
                          });
                          return (
                            <option
                              key={item.id}
                              value={item.id}
                              className={isAlreadySent ? "text-red-500" : ""}
                            >
                              Follow-Up {item.follow_up_number}
                              {isAlreadySent ? " (Already sent to some)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      {followUpError && (
                        <p className="text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          {followUpError}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Send Method
                  </label>
                  <select
                    value={sendMethod}
                    onChange={(e) => setSendMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
             <div>
  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
    Send Date
  </label>
  <input
    type="date"
    value={sendDate}
    readOnly
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none cursor-not-allowed"
  />
</div>

<div>
  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
    Send Time
  </label>
  <input
    type="time"
    value={sendTime}
    readOnly
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none cursor-not-allowed"
  />
</div>

              </div>

              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDialogOpen(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {" "}
                    Cancel
                  </button>
                  <button
                    onClick={sendFollowUps}
                    disabled={
                      !selectedFollowUpId ||
                      !sendMethod ||
                      !sendDate ||
                      !sendTime ||
                      isSending
                    }
                    className="flex items-center px-6 py-2 bg-[#004b8f] text-white rounded-lg hover:bg-[#003d73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Send Follow-Up
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedLeadmsg && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md w-full shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Lead Details
              </h2>
              <p className="mb-2 text-gray-800 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-gray-100">
                  Message:
                </strong>{" "}
                {selectedLeadmsg.notes || "N/A"}
              </p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={closeModal}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedLeadres && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md w-full shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Lead Details
              </h2>
              <p className="mb-4 text-gray-800 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-gray-100">
                  Response:
                </strong>{" "}
                {selectedLeadres.response || "N/A"}
              </p>
              <button
                onClick={closeresModal}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {leadToDelete && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Confirm Deletion
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this lead?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setLeadToDelete(null)}
                  className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(leadToDelete);
                    setLeadToDelete(null);
                  }}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showAllFollowUps && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                All Follow-Up Numbers
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {showAllFollowUps.map((num, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white border dark:border-gray-600"
                  >
                    {num.trim()}
                  </span>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAllFollowUps(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
