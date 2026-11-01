import mysql from "mysql2/promise";

// Lazily created so the server can still boot when DB settings are absent.
let pool: mysql.Pool | null = null;

export function isDbConfigured() {
  return !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME && process.env.DB_TABLE);
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST!.trim(),
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER!.trim(),
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME!.trim(),
      connectionLimit: 5,
      connectTimeout: 10000,
    });
  }
  return pool;
}

// Table name can't be a query placeholder, so restrict it to a plain identifier.
function getTableName() {
  const table = process.env.DB_TABLE!.trim();
  if (!/^[A-Za-z0-9_]+$/.test(table)) {
    throw new Error(`[DB] Invalid DB_TABLE name: ${table}`);
  }
  return table;
}

export interface LeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  panNumber: string;
  aadhaarNumber: string;
  address: string;
  pinCode: string;
  employmentType: string;
  monthlyIncome: number;
  companyName: string;
  designation: string;
  loanAmount: number;
  loanTenure: number;
}

// Form field -> DB column. Columns with no matching form field are left out of the insert.
export async function insertLead(lead: LeadInput) {
  const row: Record<string, unknown> = {
    first_name: lead.firstName,
    last_name: lead.lastName,
    email: lead.email,
    mobile: lead.phone,
    dob: lead.dob || null,
    gender: lead.gender,
    pan: lead.panNumber,
    aadhar: lead.aadhaarNumber,
    address: lead.address,
    pincode: lead.pinCode,
    emp_type: lead.employmentType,
    income: lead.monthlyIncome,
    company_name: lead.companyName,
    designation: lead.designation,
    amount: lead.loanAmount,
    duration: lead.loanTenure,
    // New leads always start at status 0
    status: 0,
  };

  const columns = Object.keys(row);
  const sql = `INSERT INTO \`${getTableName()}\` (${columns.map((c) => `\`${c}\``).join(", ")}, \`lead_date\`)
    VALUES (${columns.map(() => "?").join(", ")}, NOW())`;

  const [result] = await getPool().execute<mysql.ResultSetHeader>(sql, Object.values(row) as any[]);
  return result.insertId;
}
