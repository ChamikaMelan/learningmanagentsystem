import { useGetStripeTransactionsQuery } from "@/features/api/purchaseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import logo from '../../../assets/logo.jpg';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { marginBottom: 20 },
  logo: { width: 100, height: 50, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  dateTime: { fontSize: 10, color: '#555', marginBottom: 10 },
  table: { marginBottom: 20, borderWidth: 1, borderColor: '#000' },
  tableHeaderRow: { 
    flexDirection: 'row', 
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#000'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  tableColHeader: { width: '30%', padding: 8, borderRightWidth: 1, borderColor: '#000' },
  tableCol: { width: '30%', padding: 8, borderRightWidth: 1, borderColor: '#ddd' },
  headerText: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  text: { fontSize: 6, textAlign: 'center' }
});

const PaymentPDF = ({ transactions }) => {
  const currentDateTime = new Date().toLocaleString();
  
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={logo} />
          <Text style={styles.title}>Payment Transactions Report</Text>
          <Text style={styles.dateTime}>Generated on: {currentDateTime}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.tableColHeader}><Text style={styles.headerText}>Date</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.headerText}>User Email</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.headerText}>Method</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.headerText}>Amount</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.headerText}>Status</Text></View>
          </View>
          
          {transactions.map((tx) => (
            <View style={styles.tableRow} key={tx.id}>
              <View style={styles.tableCol}>
                <Text style={styles.text}>
                  {new Date(tx.created).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.tableCol}><Text style={styles.text}>{tx.userEmail}</Text></View>
              <View style={styles.tableCol}><Text style={styles.text}>{tx.payment_method}</Text></View>
              <View style={styles.tableCol}>
                <Text style={styles.text}>
                  {tx.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: tx.currency,
                  })}
                </Text>
              </View>
              <View style={styles.tableCol}><Text style={styles.text}>{tx.status}</Text></View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

const Payment = () => {
  const { data: transactionsData, isLoading, error } = useGetStripeTransactionsQuery();
  const transactions = transactionsData?.transactions || [];

  if (isLoading) return (
    <div className="p-4 text-center text-gray-800 dark:text-gray-200">
      Loading transactions...
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-500 dark:text-red-400">
      Error loading transactions
    </div>
  );

  return (
    <Card className="shadow-lg border-0 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            Payment Transactions
          </CardTitle>
          <PDFDownloadLink
            document={<PaymentPDF transactions={transactions} />}
            fileName="payment-transactions.pdf"
          >
            {({ loading }) => (
              <Button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                disabled={loading}
              >
                <Download size={16} />
                {loading ? "Generating..." : "Export PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto mt-4">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>
                    {new Date(tx.created).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{tx.userEmail}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                      {tx.payment_method}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: tx.currency,
                    })}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      tx.status === "paid" 
                        ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                        : "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                    }`}>
                      {tx.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {transactions.length === 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No transactions found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Payment;