import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllUsersQuery,useDeleteUserMutation } from "@/features/api/authApi";
import { Loader2, Trash } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AllUsers = () => {
  const { data, isLoading, isError } = useGetAllUsersQuery();
  const [searchTerm, setSearchTerm] = useState("");//search
  const [deleteUser] = useDeleteUserMutation();
  const [pdfError, setPdfError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const filteredUsers = data?.users?.filter((user) => {
    const userRole = user.path || "";
    return userRole.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const generatePDF = async (filteredUsers, searchTerm) => {
    try {
      // Dynamic imports with proper error handling
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      if (!filteredUsers || filteredUsers.length === 0) {
        throw new Error("No users to generate report");
      }

      const tableData = filteredUsers.map((user) => [
        user.name || "Unknown",
        user.email || "No email",
        user.dob ? new Date(user.dob).toLocaleDateString() : "N/A",
        user.path || "No role",
        user.lastLogin
          ? new Date(user.lastLogin).toLocaleString()
          : "Never logged in",
      ]);

      // Add title and metadata
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`User Report - ${searchTerm || "All Users"}`, 14, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

      // Use autoTable directly
      autoTable(doc, {
        head: [["Username", "Email", "DOB", "Role", "Last Login"]],
        body: tableData,
        startY: 30,
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [61, 142, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      });

      doc.save(`users_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      return true;
    } catch (error) {
      console.error("PDF Generation Error:", error);
      throw error;
    }
  };

  const handleGeneratePDF = async () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      setPdfError("No users found to generate report");
      toast.warning("No users available for report");
      return;
    }

    setPdfError(null);
    setIsGenerating(true);

    try {
      await generatePDF(filteredUsers, searchTerm);
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      setPdfError("Failed to generate PDF. Please try again.");
      toast.error("Failed to generate PDF report");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  if (isError)
    return (
      <div className="p-4 text-red-500">Error loading users. Please try again.</div>
    );
///

const handleDelete = async (userId) => {
  setIsDeleting(true);
  try {
    await deleteUser(userId).unwrap(); // This triggers the mutation
    toast.success("User deleted successfully");
    
     // Force a refetch of the user data
     window.location.reload();
  } catch (error) {
    toast.error(error.data?.message || "Failed to delete user");
  } finally {
    setIsDeleting(false);
    setConfirmDeleteId(null);
  }
};

////
  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by role..."
              
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100  placeholder-white-900"
              style={{
                backgroundColor: "#0a0b1f", }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black-700 "
                style={{}}
              >
                ✕
              </button>
            )}
          </div>

          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating || !filteredUsers?.length}
            className="bg-blue-600 hover:bg-blue-700 min-w-[180px]"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                Generating...
              </span>
            ) : (
              "Generate PDF Report"
            )}
          </Button>
        </div>
      </div>

      {pdfError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
          {pdfError}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableCaption>A list of all registered users</TableCaption>
          <TableHeader className="bg-blue-900 text-white">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.length ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>{user.path || "No role"}</TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "Never logged in"}
                  </TableCell>
                  <TableCell>
                  {confirmDeleteId === user._id ? (
                  <div className="flex gap-2">
                    <Button
                                   size="sm"
                                   variant="destructive"
                                   onClick={() => handleDelete(user._id)}
                                   disabled={isDeleting}
                                 >
                                   {isDeleting ? (
                                     <Loader2 className="animate-spin h-4 w-4" />
                                   ) : (
                                     "Confirm"
                                   )}
                                 </Button>
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   onClick={() => setConfirmDeleteId(null)}
                                   disabled={isDeleting}
                                 >
                                   Cancel
                                 </Button>
                               </div>
                             ) : (
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => setConfirmDeleteId(user._id)}
                                 disabled={isLoading}
                               >
                                 <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm ? "No matching users found" : "No users available"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllUsers;