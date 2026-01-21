import { addDays, subDays } from "date-fns";

export type ComplaintStatus = "Pending" | "Unassigned" | "In Progress" | "Resolved" | "Closed";
export type ComplaintPriority = "Low" | "Medium" | "High" | "Urgent";
export type UserRole = "Admin" | "Lead Agent" | "Agent" | "Staff";

export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Complaint = {
  id: string;
  number: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  categoryId: string;
  reporter: string;
  assignedTo: string | null;
  createdAt: string;
  slaDueAt: string;
};

export type Comment = {
  id: string;
  complaintId: string;
  authorId: string;
  type: "public" | "internal";
  message: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  complaintId: string;
  message: string;
  createdAt: string;
  type: "status" | "assignment" | "comment" | "note";
};

export const categories: Category[] = [
  {
    id: "cat-it",
    name: "IT Outage",
    description: "Connectivity, networking, and device incidents",
  },
  {
    id: "cat-billing",
    name: "Billing",
    description: "Invoices, pricing, and credit notes",
  },
  {
    id: "cat-service",
    name: "Service Quality",
    description: "Response time, courtesy, and general service quality",
  },
  {
    id: "cat-product",
    name: "Product Issue",
    description: "Defects, malfunctions, or missing items",
  },
  {
    id: "cat-compliance",
    name: "Compliance",
    description: "Data, privacy, and regulatory escalations",
  },
];

export const users: User[] = [
  { id: "u-admin", name: "Avery Stone", email: "avery@acme.gov", role: "Admin" },
  { id: "u-amy", name: "Amira Patel", email: "amira@acme.gov", role: "Lead Agent" },
  { id: "u-lee", name: "Lee Chen", email: "lee.chen@acme.gov", role: "Agent" },
  { id: "u-nina", name: "Nina Brooks", email: "nina@acme.gov", role: "Agent" },
  { id: "u-sam", name: "Samir Malik", email: "samir@acme.gov", role: "Staff" },
  { id: "u-riley", name: "Riley Flores", email: "riley@acme.gov", role: "Staff" },
];

const prioritySlaDays: Record<ComplaintPriority, number> = {
  Low: 10,
  Medium: 7,
  High: 5,
  Urgent: 3,
};

const seedComplaints = [
  {
    subject: "Branch network outage impacting POS",
    description: "POS terminals cannot reach gateway; routers show intermittent packet loss.",
    categoryId: "cat-it",
    priority: "Urgent" as ComplaintPriority,
    reporter: "Dina Cruz",
    assignedTo: "u-amy",
  },
  {
    subject: "Duplicate billing detected on contract",
    description: "Customer reports being billed twice for the same contract period.",
    categoryId: "cat-billing",
    priority: "Medium" as ComplaintPriority,
    reporter: "Viktor Hale",
    assignedTo: null,
  },
  {
    subject: "Slow response on ticket follow-up",
    description: "Customer waited over 48 hours for an update on escalation.",
    categoryId: "cat-service",
    priority: "High" as ComplaintPriority,
    reporter: "Karina Ellis",
    assignedTo: "u-lee",
  },
  {
    subject: "Device shipped with cracked casing",
    description: "Replacement tablet arrived damaged with cracks on the screen bezel.",
    categoryId: "cat-product",
    priority: "High" as ComplaintPriority,
    reporter: "Omari Lewis",
    assignedTo: "u-nina",
  },
  {
    subject: "Privacy concern about exported data",
    description: "Customer believes a report was shared externally without consent.",
    categoryId: "cat-compliance",
    priority: "Urgent" as ComplaintPriority,
    reporter: "Alana Price",
    assignedTo: null,
  },
  {
    subject: "POS devices rebooting during checkout",
    description: "Store reports random device restarts causing abandoned carts.",
    categoryId: "cat-it",
    priority: "Medium" as ComplaintPriority,
    reporter: "Nico Ward",
    assignedTo: "u-amy",
  },
  {
    subject: "SMS alerts not sending",
    description: "Daily threshold SMS alerts have stopped for multiple customers.",
    categoryId: "cat-product",
    priority: "Low" as ComplaintPriority,
    reporter: "Casey Holt",
    assignedTo: "u-riley",
  },
  {
    subject: "Late invoice delivery",
    description: "Invoices are arriving after due date, causing late fees.",
    categoryId: "cat-billing",
    priority: "Low" as ComplaintPriority,
    reporter: "Gwen Torres",
    assignedTo: "u-sam",
  },
  {
    subject: "Agent tone perceived as dismissive",
    description: "Caller felt the support agent was dismissive during call.",
    categoryId: "cat-service",
    priority: "Medium" as ComplaintPriority,
    reporter: "Jules Carter",
    assignedTo: "u-lee",
  },
  {
    subject: "Account data mismatch across systems",
    description: "Customer name differs between CRM and billing export.",
    categoryId: "cat-compliance",
    priority: "High" as ComplaintPriority,
    reporter: "Priya Raman",
    assignedTo: "u-nina",
  },
];

const referenceDate = new Date("2026-01-20T12:00:00Z");

export const complaints: Complaint[] = Array.from({ length: 30 }).map((_, index) => {
  const seed = seedComplaints[index % seedComplaints.length];
  const statusCycle: ComplaintStatus[] = [
    "Unassigned",
    "In Progress",
    "Resolved",
    "Closed",
    "In Progress",
    "Unassigned",
  ];
  const status = statusCycle[index % statusCycle.length];

  const createdAt = subDays(referenceDate, index * 1.25 + (index % 3));
  const slaDays = prioritySlaDays[seed.priority] - (index % 2 === 0 ? 1 : 0);
  const slaDueAt = addDays(createdAt, Math.max(slaDays, 2));

  const assignedTo = status === "Unassigned" ? null : seed.assignedTo;

  return {
    id: `cmp-${index + 1}`,
    number: `CMP-2026-${String(index + 1).padStart(6, "0")}`,
    subject: seed.subject,
    description: seed.description,
    status,
    priority: seed.priority,
    categoryId: seed.categoryId,
    reporter: seed.reporter,
    assignedTo,
    createdAt: createdAt.toISOString(),
    slaDueAt: slaDueAt.toISOString(),
  } satisfies Complaint;
});

export const comments: Comment[] = [
  {
    id: "com-1",
    complaintId: "cmp-1",
    authorId: "u-amy",
    type: "internal",
    message: "Looped in network engineering, awaiting traceroute results.",
    createdAt: subDays(referenceDate, 1).toISOString(),
  },
  {
    id: "com-2",
    complaintId: "cmp-1",
    authorId: "u-amy",
    type: "public",
    message: "We are investigating the intermittent packet loss with the ISP.",
    createdAt: subDays(referenceDate, 1).toISOString(),
  },
  {
    id: "com-3",
    complaintId: "cmp-3",
    authorId: "u-lee",
    type: "public",
    message: "Queued follow-up call for 2pm today.",
    createdAt: subDays(referenceDate, 2).toISOString(),
  },
  {
    id: "com-4",
    complaintId: "cmp-4",
    authorId: "u-nina",
    type: "internal",
    message: "Device RMA approved, tracking shared with customer.",
    createdAt: subDays(referenceDate, 3).toISOString(),
  },
  {
    id: "com-5",
    complaintId: "cmp-10",
    authorId: "u-nina",
    type: "public",
    message: "Data discrepancy validated; syncing with billing tonight.",
    createdAt: subDays(referenceDate, 1).toISOString(),
  },
];

export const activities: Activity[] = [
  {
    id: "act-1",
    complaintId: "cmp-1",
    type: "status",
    message: "Status changed to In Progress by Amira Patel",
    createdAt: subDays(referenceDate, 2).toISOString(),
  },
  {
    id: "act-2",
    complaintId: "cmp-1",
    type: "assignment",
    message: "Assigned to Network Squad (Amira Patel)",
    createdAt: subDays(referenceDate, 2).toISOString(),
  },
  {
    id: "act-3",
    complaintId: "cmp-2",
    type: "comment",
    message: "Public comment added by Viktor Hale",
    createdAt: subDays(referenceDate, 3).toISOString(),
  },
  {
    id: "act-4",
    complaintId: "cmp-4",
    type: "status",
    message: "Status changed to Resolved by Nina Brooks",
    createdAt: subDays(referenceDate, 4).toISOString(),
  },
  {
    id: "act-5",
    complaintId: "cmp-10",
    type: "assignment",
    message: "Reassigned to Compliance (Nina Brooks)",
    createdAt: subDays(referenceDate, 1).toISOString(),
  },
];

export function getComplaintById(id: string) {
  return complaints.find((c) => c.id === id);
}

export function getUserById(id: string) {
  return users.find((u) => u.id === id);
}
