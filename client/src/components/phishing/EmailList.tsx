import { useState } from "react";
import { PhishingEmail } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  SortAsc, 
  SortDesc 
} from "lucide-react";

interface EmailListProps {
  emails: PhishingEmail[];
  isLoading: boolean;
  onEmailSelected: (email: PhishingEmail) => void;
}

const EmailList = ({ emails, isLoading, onEmailSelected }: EmailListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Analyzed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Pending": return <Clock className="h-4 w-4 text-blue-500" />;
      case "Quarantined": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Analyzed": return "bg-green-100 text-green-800";
      case "Pending": return "bg-blue-100 text-blue-800";
      case "Quarantined": return "bg-red-100 text-red-800";
      default: return "bg-slate-100";
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score < 40) return "text-green-600";
    if (score < 70) return "text-amber-600";
    return "text-red-600";
  };

  // Filter and sort emails
  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter if selected
    if (statusFilter) {
      return matchesSearch && email.status === statusFilter;
    }
    
    return matchesSearch;
  });
  
  const sortedEmails = [...filteredEmails].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.receivedAt).getTime();
      const dateB = new Date(b.receivedAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else { // sort by score
      return sortOrder === "asc" 
        ? a.phishingScore - b.phishingScore 
        : b.phishingScore - a.phishingScore;
    }
  });

  // Handle sort change
  const handleSortChange = (field: "date" | "score") => {
    if (sortBy === field) {
      // Toggle order if same field clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to descending order
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setStatusFilter(null)}
            className={!statusFilter ? "bg-slate-100" : ""}
          >
            All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setStatusFilter("Quarantined")}
            className={statusFilter === "Quarantined" ? "bg-red-50 text-red-700 border-red-200" : ""}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Quarantined
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setStatusFilter("Analyzed")}
            className={statusFilter === "Analyzed" ? "bg-green-50 text-green-700 border-green-200" : ""}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Analyzed
          </Button>
        </div>
      </div>
      
      {emails.length === 0 ? (
        <div className="text-center py-6 border rounded-md bg-slate-50">
          <Filter className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-slate-700">No Emails Found</h3>
          <p className="text-slate-500 mt-1">No emails have been analyzed yet.</p>
          <p className="text-slate-500">Use the "Analyze Email" tab to get started.</p>
        </div>
      ) : sortedEmails.length === 0 ? (
        <div className="text-center py-6 border rounded-md bg-slate-50">
          <Search className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-slate-700">No Matching Emails</h3>
          <p className="text-slate-500 mt-1">
            No emails match your current search criteria.
          </p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchTerm("");
              setStatusFilter(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Subject</TableHead>
                <TableHead className="w-[200px]">Sender</TableHead>
                <TableHead className="w-[120px]">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSortChange("score")}
                  >
                    Score
                    {sortBy === "score" && (
                      sortOrder === "asc" ? 
                        <SortAsc className="h-4 w-4 ml-1" /> : 
                        <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[150px]">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSortChange("date")}
                  >
                    Date
                    {sortBy === "date" && (
                      sortOrder === "asc" ? 
                        <SortAsc className="h-4 w-4 ml-1" /> : 
                        <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {sortedEmails.map((email) => (
                <TableRow 
                  key={email.id}
                  className="group"
                >
                  <TableCell className="font-medium">{email.subject}</TableCell>
                  <TableCell>{email.sender}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${getScoreColor(email.phishingScore)}`}>
                      {email.phishingScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(email.status)}>
                      <span className="flex items-center">
                        {getStatusIcon(email.status)}
                        <span className="ml-1">{email.status}</span>
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(email.receivedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEmailSelected(email)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <div className="text-sm text-slate-500 text-right">
        {filteredEmails.length} {filteredEmails.length === 1 ? 'email' : 'emails'} found
      </div>
    </div>
  );
};

export default EmailList;