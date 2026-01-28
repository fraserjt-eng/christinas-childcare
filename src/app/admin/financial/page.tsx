"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Lightbulb,
  FileDown,
} from "lucide-react";

const overviewCards = [
  { title: "Total Enrolled", value: "87", subtitle: "children", icon: Users },
  { title: "Monthly Revenue", value: "$43,500", subtitle: "+8% from last month", icon: DollarSign },
  { title: "Outstanding Balances", value: "$2,340", subtitle: "6 families", icon: AlertCircle },
  { title: "CACFP Reimbursement", value: "$3,200", subtitle: "this month", icon: TrendingUp },
];

const revenueTrend = [
  { month: "Jan", amount: 38200 },
  { month: "Feb", amount: 39800 },
  { month: "Mar", amount: 41000 },
  { month: "Apr", amount: 42100 },
  { month: "May", amount: 43000 },
  { month: "Jun", amount: 43500 },
];

const aiSuggestions = [
  {
    title: "Optimize Staffing Ratios",
    description:
      "Based on enrollment trends, you could consolidate the Toddler B and Toddler C rooms on Fridays to save approximately $1,200/month in staffing costs.",
  },
  {
    title: "CACFP Claim Review",
    description:
      "Your April CACFP claim was $400 below average. Ensure all eligible meals are being documented \u2014 switching to digital meal tracking could recover $200-400/month.",
  },
  {
    title: "Tuition Adjustment Opportunity",
    description:
      "Market analysis shows your infant rate is 12% below area average. A $25/week increase would generate an additional $5,200/month across 52 infant slots.",
  },
];

const expenses = [
  { category: "Staffing", amount: 24500, pct: 56, color: "bg-christina-red" },
  { category: "Food", amount: 4800, pct: 11, color: "bg-orange-500" },
  { category: "Supplies", amount: 2100, pct: 5, color: "bg-yellow-500" },
  { category: "Rent", amount: 6000, pct: 14, color: "bg-blue-500" },
  { category: "Insurance", amount: 2200, pct: 5, color: "bg-purple-500" },
  { category: "Utilities", amount: 1400, pct: 3, color: "bg-green-500" },
  { category: "Other", amount: 2500, pct: 6, color: "bg-gray-500" },
];

const transactions = [
  { date: "Jun 28", desc: "Tuition - Rodriguez Family", category: "Revenue", amount: 1250, balance: 48230 },
  { date: "Jun 27", desc: "Sysco Food Delivery", category: "Food", amount: -682, balance: 46980 },
  { date: "Jun 27", desc: "Tuition - Chen Family", category: "Revenue", amount: 980, balance: 47662 },
  { date: "Jun 26", desc: "Staff Payroll (Bi-Weekly)", category: "Staffing", amount: -12250, balance: 46682 },
  { date: "Jun 25", desc: "CACFP Reimbursement - May", category: "Revenue", amount: 3200, balance: 58932 },
  { date: "Jun 24", desc: "Lakeshore Learning Supplies", category: "Supplies", amount: -347, balance: 55732 },
  { date: "Jun 23", desc: "Tuition - Williams Family", category: "Revenue", amount: 1100, balance: 56079 },
  { date: "Jun 22", desc: "ComEd Electric Bill", category: "Utilities", amount: -485, balance: 54979 },
  { date: "Jun 21", desc: "Late Fee - Thompson Family", category: "Revenue", amount: 50, balance: 55464 },
  { date: "Jun 20", desc: "Building Insurance - Monthly", category: "Insurance", amount: -2200, balance: 55414 },
];

const plRevenue = [
  { item: "Tuition", amount: 38500 },
  { item: "CACFP Reimbursement", amount: 3200 },
  { item: "Late Fees", amount: 300 },
  { item: "Registration Fees", amount: 1500 },
];

const plExpenses = expenses;

export default function FinancialPlanningPage() {
  const totalRevenue = plRevenue.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = plExpenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Financial Planning</h1>
        <Button className="bg-christina-red hover:bg-christina-red/90">
          <FileDown className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-christina-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="pnl">P&amp;L</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-christina-red" />
                Revenue Trend (Jan \u2014 Jun)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueTrend.map((m) => {
                  const pct = Math.round((m.amount / 45000) * 100);
                  return (
                    <div key={m.month} className="flex items-center gap-4">
                      <span className="w-10 text-sm font-medium">{m.month}</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-christina-red rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-20 text-sm font-medium text-right">
                        ${m.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-christina-red" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestions.map((s, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-christina-red text-christina-red">
                      Suggestion
                    </Badge>
                    <h4 className="font-semibold">{s.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenses.map((e) => (
              <Card key={e.category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {e.category}
                    <Badge variant="secondary">{e.pct}%</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold">
                    ${e.amount.toLocaleString()}
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${e.color} rounded-full`}
                      style={{ width: `${e.pct}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Ledger Tab */}
        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-christina-red" />
                Transaction Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{t.date}</TableCell>
                      <TableCell>{t.desc}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.category}</Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          t.amount >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.amount >= 0 ? "+" : ""}
                        ${Math.abs(t.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${t.balance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* P&L Tab */}
        <TabsContent value="pnl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-christina-red" />
                Monthly Profit &amp; Loss
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-700">Revenue</h3>
                <div className="space-y-2">
                  {plRevenue.map((r) => (
                    <div key={r.item} className="flex justify-between text-sm">
                      <span>{r.item}</span>
                      <span className="font-medium">${r.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Revenue</span>
                    <span className="text-green-700">${totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-700">Expenses</h3>
                <div className="space-y-2">
                  {plExpenses.map((e) => (
                    <div key={e.category} className="flex justify-between text-sm">
                      <span>{e.category}</span>
                      <span className="font-medium">${e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Expenses</span>
                    <span className="text-red-700">${totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Net Income</span>
                  <span
                    className={`text-2xl font-bold ${
                      netIncome >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    ${netIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
