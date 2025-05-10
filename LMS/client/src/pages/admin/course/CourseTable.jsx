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

import logo from '../../../assets/logo.jpg';

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
  tableColHeaderTitle: {
    width: '30%',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  tableColHeaderPrice: {
    width: '10%',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  tableColHeaderDefault: {
    width: '20%',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  tableColTitle: {
    width: '30%',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  tableColPrice: {
    width: '10%',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  tableColDefault: {
    width: '20%',
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

const CoursePDF = ({ courses }) => {
  const currentDateTime = new Date().toLocaleString();

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={logo} />
          <Text style={styles.title}>Course Report</Text>
          <Text style={styles.dateTime}>Generated on: {currentDateTime}</Text>
        </View>

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

  const [searchTitle, setSearchTitle] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  if (isLoading) return <h1>Loading...</h1>;

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
        <Button
          onClick={() => navigate(`create`)}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition duration-200"
        >
          Create a New Course
        </Button>

        <PDFDownloadLink
          document={<CoursePDF courses={filteredCourses} />}
          fileName="courses.pdf"
        >
          {({ loading }) => (
            <Button
              className="bg-white text-blue-600 font-semibold border border-blue-600 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition duration-200"
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
  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition duration-200 placeholder-white"
/>

        <select
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition duration-200"
        >
          <option value="">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>
      <p className="text-sm text-gray-600 mb-2 text-white font-bold ">
        Total Courses: {filteredCourses.length}
      </p>

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
                    className="text-blue-600 hover:text-blue-800 transition duration-200"
                    onClick={() => navigate(`${course._id}`)}
                  >
                    <Edit className="w-4 h-4" />
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
