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

// Cheap round trip for health checks; throws if the database can't be reached
export async function pingDb() {
  await getPool().query("SELECT 1");
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

// Returns the lead's full row, or undefined when no lead has this loan number.
export async function getLeadByLoanNumber(loanNumber: string) {
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>(
    `SELECT * FROM \`${getTableName()}\` WHERE \`loan_number\` = ? LIMIT 1`,
    [loanNumber]
  );
  return rows[0];
}

// Sanctioned loan terms, kept in a separate table keyed by loan_number
export async function getLoanDetails(loanNumber: string) {
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>(
    "SELECT * FROM `tbl_loan_details` WHERE `loan_number` = ? LIMIT 1",
    [loanNumber]
  );
  return rows[0];
}

// Returns the lead's current docs_paths, or undefined when no lead has this loan number.
export async function getDocsPaths(loanNumber: string) {
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>(
    `SELECT \`docs_paths\` FROM \`${getTableName()}\` WHERE \`loan_number\` = ? LIMIT 1`,
    [loanNumber]
  );
  if (rows.length === 0) return undefined;
  return (rows[0].docs_paths as string | null) ?? null;
}

export async function saveDocsPaths(loanNumber: string, docsPaths: string) {
  await getPool().execute(
    `UPDATE \`${getTableName()}\` SET \`docs_paths\` = ? WHERE \`loan_number\` = ?`,
    [docsPaths, loanNumber]
  );
}
