import { Badge } from "@/components/ui/badge";
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
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Edit } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

// Import the logo image
import logo from '../../../assets/logo.jpg'; // Adjust the path based on your file structure

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 10,
    color: '#555',
    marginBottom: 10,
  },
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  // Specific styles for each column header
  tableColHeaderTitle: {
    width: '30%', // Increased width for Title
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  tableColHeaderPrice: {
    width: '10%', // Decreased width for Price
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  tableColHeaderDefault: {
    width: '20%', // Default width for Status, Category, Created Date
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  // Specific styles for each column cell
  tableColTitle: {
    width: '30%', // Increased width for Title
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  tableColPrice: {
    width: '10%', // Decreased width for Price
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  tableColDefault: {
    width: '20%', // Default width for Status, Category, Created Date
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  headerText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    fontSize: 9,
    textAlign: 'center',
  },
});

// PDF Document Component
// PDF Document Component
const CoursePDF = ({ courses }) => {
  // Get current date and time
  const currentDateTime = new Date().toLocaleString();

  return (
    <Document>
      <Page style={styles.page}>
        {/* Header with Logo, Title, and Date/Time */}
        <View style={styles.header}>
          {/* Logo on the top-left */}
          <Image
            style={styles.logo}
            src={logo} // Use the imported logo
          />
          <Text style={styles.title}>Course Report</Text>
          <Text style={styles.dateTime}>Generated on: {currentDateTime}</Text>
        </View>

        {/* Combined Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.tableColHeaderTitle}>
              <Text style={styles.headerText}>Title</Text>
            </View>
            <View style={styles.tableColHeaderPrice}>
              <Text style={styles.headerText}>Price</Text>
            </View>
            <View style={styles.tableColHeaderDefault}>
              <Text style={styles.headerText}>Status</Text>
            </View>
            <View style={styles.tableColHeaderDefault}>
              <Text style={styles.headerText}>Category</Text>
            </View>
            <View style={styles.tableColHeaderDefault}>
              <Text style={styles.headerText}>Created Date</Text>
            </View>
          </View>
          {courses.map((course, index) => (
            <View
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.evenRow : styles.oddRow,
              ]}
              key={course._id}
            >
              <View style={styles.tableColTitle}>
                <Text style={styles.text}>{course.courseTitle}</Text>
              </View>
              <View style={styles.tableColPrice}>
                <Text style={styles.text}>{course?.coursePrice || "NA"}</Text>
              </View>
              <View style={styles.tableColDefault}>
                <Text style={styles.text}>
                  {course.isPublished ? "Published" : "Draft"}
                </Text>
              </View>
              <View style={styles.tableColDefault}>
                <Text style={styles.text}>{course?.category || "NA"}</Text>
              </View>
              <View style={styles.tableColDefault}>
                <Text style={styles.text}>
                  {course?.createdAt
                    ? new Date(course.createdAt).toLocaleDateString()
                    : "NA"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

const CourseTable = () => {
  const { data, isLoading } = useGetCreatorCourseQuery();
  const navigate = useNavigate();

  // State for search inputs
  const [searchTitle, setSearchTitle] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  if (isLoading) return <h1>Loading...</h1>;

  // Filter courses based on search inputs
  const filteredCourses = data.courses.filter((course) => {
    const titleMatch = course.courseTitle
      .toLowerCase()
      .includes(searchTitle.toLowerCase());
    const statusMatch =
      searchStatus === "" ||
      (searchStatus === "Published" && course.isPublished) ||
      (searchStatus === "Draft" && !course.isPublished);
    return titleMatch && statusMatch;
  });

  return (
    <div className="p-4">
      {/* Buttons */}
      <div className="flex justify-between mb-4">
        <Button onClick={() => navigate(`create`)}>Create a new course</Button>
        <PDFDownloadLink
          document={<CoursePDF courses={filteredCourses} />}
          fileName="courses.pdf"
        >
          {({ loading }) => (
            <Button
              className="text-black bg-white border border-black hover:bg-gray-100"
            >
              {loading ? "Generating PDF..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* Search Inputs */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="border border-black p-2 rounded w-1/3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
          className="border border-black p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <Table>
        <TableCaption>A list of your recent courses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <TableRow key={course._id}>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell className="font-medium">
                  {course?.coursePrice || "NA"}
                </TableCell>
                <TableCell>
                  <Badge>{course.isPublished ? "Published" : "Draft"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`${course._id}`)}
                  >
                    <Edit />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No courses found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseTable;